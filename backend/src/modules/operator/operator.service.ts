import { Queue } from "../queue/queue.model.js";
import { Token, TokenStatus } from "../queue/token.model.js";
import { User } from "../auth/user.model.js";
import { env } from "../../config/env.js";
import {
  getNowServing,
  popNextToken,
  removeToken,
  setNowServing,
  enqueueToken,
} from "../queue/services/redisQueue.service.js";
import { syncQueueFullFlag } from "../queue/services/capacity.service.js";

export interface OperatorResponse {
  success: boolean;
  token?: {
    id: string;
    queueId: string;
    seq: number;
    status: TokenStatus;
    createdAt: string;
  };
  queue?: {
    id: string;
    name: string;
    isActive: boolean;
    nextSequence: number;
    capacity?: number;
    isFull?: boolean;
  };
  error?: string;
}

export class OperatorService {
  // Serve next token in queue
  static async serveNextToken(queueId: string): Promise<OperatorResponse> {
    try {
      // First, mark any currently served token as completed and clear user state
      const nowServingId = await getNowServing(queueId);
      const currentlyServed = nowServingId
        ? await Token.findById(nowServingId)
        : await Token.findOne({
          queue: queueId,
          status: TokenStatus.SERVED,
        }).sort({ seq: -1 });

      if (currentlyServed) {
        currentlyServed.status = TokenStatus.COMPLETED;
        await currentlyServed.save();

        // Clear the user's queue cache (Token table is source of truth)
        const user = await User.findById(currentlyServed.userId);
        if (user && user.currentQueue && user.currentQueue.equals(queueId)) {
          user.currentQueue = undefined;
          await user.save();
        }

        await removeToken(queueId, currentlyServed._id.toString());
        await setNowServing(queueId, null);
      }

      // Find the next waiting token with lowest sequence number
      const redisNext = await popNextToken(queueId);
      let nextToken = redisNext
        ? await Token.findById(redisNext.id)
        : await Token.findOne({
          queue: queueId,
          status: TokenStatus.WAITING,
        }).sort({ seq: 1 });

      if (nextToken && nextToken.status !== TokenStatus.WAITING) {
        nextToken = await Token.findOne({
          queue: queueId,
          status: TokenStatus.WAITING,
        }).sort({ seq: 1 });
      }

      if (!nextToken) {
        return {
          success: false,
          error: "No waiting tokens found in queue",
        };
      }

      // Update status to SERVED
      nextToken.status = TokenStatus.SERVED;
      // Set expiry based on env config
      const expiryMinutes = env.TOKEN_EXPIRY_MINUTES || 5;

      nextToken.expireAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

      await nextToken.save();

      await setNowServing(queueId, nextToken._id.toString());

      await syncQueueFullFlag(queueId);

      return {
        success: true,
        token: {
          id: nextToken._id.toString(),
          queueId: nextToken.queue.toString(),
          seq: nextToken.seq,
          status: nextToken.status,
          createdAt: nextToken.createdAt.toISOString(),
        },
      };
    } catch {
      return {
        success: false,
        error: "Failed to serve next token",
      };
    }
  }

  // Skip current token (the one being served)
  static async skipCurrentToken(queueId: string): Promise<OperatorResponse> {
    try {
      // Find the current token (last served token)
      const nowServingId = await getNowServing(queueId);
      const currentToken = nowServingId
        ? await Token.findById(nowServingId)
        : await Token.findOne({
          queue: queueId,
          status: TokenStatus.SERVED,
        }).sort({ seq: -1 });

      if (!currentToken) {
        return {
          success: false,
          error: "No current token to skip",
        };
      }

      // Update token status to skipped
      currentToken.status = TokenStatus.SKIPPED;
      await currentToken.save();

      await removeToken(queueId, currentToken._id.toString());
      await setNowServing(queueId, null);

      await syncQueueFullFlag(queueId);

      return {
        success: true,
        token: {
          id: currentToken._id.toString(),
          queueId: currentToken.queue.toString(),
          seq: currentToken.seq,
          status: currentToken.status,
          createdAt: currentToken.createdAt.toISOString(),
        },
      };
    } catch {
      return {
        success: false,
        error: "Failed to skip current token",
      };
    }
  }

  // Recall current token (change skipped back to waiting)
  static async recallCurrentToken(queueId: string): Promise<OperatorResponse> {
    try {
      // Find the last skipped token
      const skippedToken = await Token.findOne({
        queue: queueId,
        status: TokenStatus.SKIPPED,
      }).sort({ seq: -1 });

      if (!skippedToken) {
        return {
          success: false,
          error: "No skipped token to recall",
        };
      }

      // Update token status back to waiting
      skippedToken.status = TokenStatus.WAITING;
      await skippedToken.save();

      await enqueueToken(
        queueId,
        skippedToken._id.toString(),
        skippedToken.seq,
      );

      await syncQueueFullFlag(queueId);

      return {
        success: true,
        token: {
          id: skippedToken._id.toString(),
          queueId: skippedToken.queue.toString(),
          seq: skippedToken.seq,
          status: skippedToken.status,
          createdAt: skippedToken.createdAt.toISOString(),
        },
      };
    } catch {
      return {
        success: false,
        error: "Failed to recall token",
      };
    }
  }

  // Pause queue (stop accepting new tokens)
  static async pauseQueue(queueId: string): Promise<OperatorResponse> {
    try {
      const queue = await Queue.findByIdAndUpdate(
        queueId,
        { isActive: false },
        { new: true, runValidators: true },
      );

      if (!queue) {
        return {
          success: false,
          error: "Queue not found",
        };
      }

      return {
        success: true,
        queue: {
          id: queue._id.toString(),
          name: queue.name,
          isActive: queue.isActive,
          nextSequence: queue.nextSequence,
        },
      };
    } catch {
      return {
        success: false,
        error: "Failed to pause queue",
      };
    }
  }

  // Resume queue (start accepting new tokens)
  static async resumeQueue(queueId: string): Promise<OperatorResponse> {
    try {
      const queue = await Queue.findByIdAndUpdate(
        queueId,
        { isActive: true },
        { new: true, runValidators: true },
      );

      if (!queue) {
        return {
          success: false,
          error: "Queue not found",
        };
      }

      return {
        success: true,
        queue: {
          id: queue._id.toString(),
          name: queue.name,
          isActive: queue.isActive,
          nextSequence: queue.nextSequence,
          capacity: queue.capacity,
          isFull: queue.isFull,
        },
      };
    } catch {
      return {
        success: false,
        error: "Failed to resume queue",
      };
    }
  }

  static async updateCapacity(
    queueId: string,
    capacity: number,
  ): Promise<OperatorResponse> {
    try {
      const queue = await Queue.findById(queueId);
      if (!queue) {
        return { success: false, error: "Queue not found" };
      }

      queue.capacity = capacity;

      const waitingCount = await Token.countDocuments({
        queue: queueId,
        status: TokenStatus.WAITING,
      });

      queue.isFull = waitingCount >= capacity;
      await queue.save();

      return {
        success: true,
        queue: {
          id: queue._id.toString(),
          name: queue.name,
          isActive: queue.isActive,
          nextSequence: queue.nextSequence,
          capacity: queue.capacity,
          isFull: queue.isFull,
        },
      };
    } catch {
      return { success: false, error: "Failed to update capacity" };
    }
  }
}
