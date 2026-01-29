import { Queue } from "../queue.model.js";
import { Token, TokenStatus } from "../token.model.js";
import { Types } from "mongoose";
import {
  enqueueToken,
  removeToken,
  setNowServing,
} from "./redisQueue.service.js";
import { checkRateLimits, recordJoin } from "./rateLimit.service.js";
import {
  ensureCapacityAvailable,
  syncQueueFullFlag,
} from "./capacity.service.js";

export interface TokenResponse {
  success: boolean;
  token?: {
    id: string;
    queueId: string;
    seq: number;
    status: TokenStatus;
    createdAt: string;
  };
  error?: string;
  retryAfterSeconds?: number;
}

export class TokenService {
  // generate token for a user in a queue
  // Note: userId is required by Token schema, so this method requires it
  static async generateToken(
    queueId: string,
    userId?: string,
  ): Promise<TokenResponse> {
    try {
      if (!userId) {
        return {
          success: false,
          error: "UserId is required to generate a token",
        };
      }

      // Rate limit check before allowing queue join
      const rateLimitResult = await checkRateLimits(userId, queueId);
      if (!rateLimitResult.allowed) {
        return {
          success: false,
          error: rateLimitResult.message,
          retryAfterSeconds: rateLimitResult.retryAfterSeconds,
        };
      }

      // Check if user is already in any queue (since userId is unique index)
      const existingToken = await Token.findOne({
        userId: new Types.ObjectId(userId),
        status: { $in: [TokenStatus.WAITING, TokenStatus.SERVED] }
      });

      if (existingToken) {
        return {
          success: false,
          error: "You are already in a queue",
        };
      }

      const capacityState = await ensureCapacityAvailable(queueId);
      const queue = capacityState.queue;

      if (!queue || !queue.isActive) {
        return {
          success: false,
          error: "Queue not found or inactive",
        };
      }

      if (capacityState.isFull) {
        return {
          success: false,
          error: "This queue is currently full. Please try again later.",
        };
      }

      const queueSnapshot = await Queue.findOneAndUpdate(
        { _id: queueId, isActive: true },
        { $inc: { nextSequence: 1 } },
        { new: false },
      );

      if (!queueSnapshot) {
        return {
          success: false,
          error: "Queue not found or inactive",
        };
      }

      const seq = queueSnapshot.nextSequence;

      // Create token with userId (required by schema)
      const token = await Token.create({
        queue: queueSnapshot._id,
        userId: new Types.ObjectId(userId),
        seq,
        status: TokenStatus.WAITING,
      });

      await enqueueToken(queueSnapshot._id.toString(), token._id.toString(), seq);

      // Record successful join for rate limiting
      await recordJoin(userId, queueId);

      const waitingAfterJoin = capacityState.waitingCount + 1;
      const shouldBeFull = waitingAfterJoin >= queue.capacity;
      if (queue.isFull !== shouldBeFull) {
        await Queue.findByIdAndUpdate(queueId, { isFull: shouldBeFull });
      }

      return {
        success: true,
        token: {
          id: token._id.toString(),
          queueId: token.queue.toString(),
          seq: token.seq,
          status: token.status,
          createdAt: token.createdAt.toISOString(),
        },
      };
    } catch (error: any) {
      console.error("Token generation error:", error);

      // Handle duplicate key error specifically (race condition fallback)
      if (error.code === 11000) {
        return {
          success: false,
          error: "You are already in a queue",
        };
      }

      return {
        success: false,
        error: "Failed to generate token",
      };
    }
  }
  //--------------------------------update token status--
  static async updateStatus(
    tokenId: string,
    status: TokenStatus,
    expireAt?: Date,
  ): Promise<TokenResponse> {
    try {
      const token = await Token.findById(tokenId);
      if (!token) {
        return {
          success: false,
          error: "Token not found",
        };
      }

      token.status = status;
      if (expireAt) {
        token.expireAt = expireAt;
      } else if (
        status === TokenStatus.COMPLETED ||
        status === TokenStatus.CANCELLED
      ) {
        token.expireAt = undefined;
      }

      await token.save();

      const queueId = token.queue.toString();
      if (status === TokenStatus.WAITING) {
        await enqueueToken(queueId, token._id.toString(), token.seq);
      } else if (status === TokenStatus.SERVED) {
        await removeToken(queueId, token._id.toString());
        await setNowServing(queueId, token._id.toString());
      } else {
        await removeToken(queueId, token._id.toString());
      }

      await syncQueueFullFlag(queueId);

      return {
        success: true,
        token: {
          id: token._id.toString(),
          queueId: token.queue.toString(),
          seq: token.seq,
          status: token.status,
          createdAt: token.createdAt.toISOString(),
        },
      };
    } catch (error) {
      console.error("Update Token Status Error:", error);
      return {
        success: false,
        error: "Failed to update token status",
      };
    }
  }
}
