import { Queue, Token, TokenStatus } from "../queue.model.js";

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
}

export class TokenService {
  // generate token for a user in a queue
  static async generateToken(queueId: string): Promise<TokenResponse> {
    try {
      const queue = await Queue.findOneAndUpdate(
        { _id: queueId, isActive: true },
        { $inc: { nextSequence: 1 } },
        { new: false }
      );

      if (!queue) {
        return {
          success: false,
          error: "Queue not found or inactive",
        };
      }

      const seq = queue.nextSequence;

      const token = await Token.create({
        queue: queue._id,
        seq,
        status: TokenStatus.WAITING,
      });

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
      console.error("Token generation error:", error);
      return {
        success: false,
        error: "Failed to generate token",
      };
    }
  }
//--------------------------------update token status--
  static async updateStatus(
    tokenId: string,
    status: TokenStatus
  ): Promise<TokenResponse> {
    try {
      const token = await Token.findByIdAndUpdate(
        tokenId,
        { status },
        { new: true, runValidators: true}
      );

      if (!token) {
        return {
          success: false,
          error: "Token not found",
        };
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
    } catch {
      return {
        success: false,
        error: "Failed to update token status",
      };
    }
  }
}
