import { Queue, Token, TokenStatus } from "../queue/queue.model.js";
import { User } from "../auth/user.model.js";

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
  };
  error?: string;
}

export class OperatorService {
  // Serve next token in queue
  static async serveNextToken(queueId: string): Promise<OperatorResponse> {
    try {
      // First, mark any currently served token as completed and clear user state
      const currentlyServed = await Token.findOne({
        queue: queueId,
        status: TokenStatus.SERVED,
      }).sort({ seq: -1 });

      if (currentlyServed) {
        currentlyServed.status = TokenStatus.COMPLETED;
        await currentlyServed.save();

        // Clear the user's queue status
        await User.updateMany(
          { currentQueue: queueId, isInQueue: true },
          { $set: { isInQueue: false }, $unset: { currentQueue: 1 } }
        );
      }

      // Find the next waiting token with lowest sequence number
      const nextToken = await Token.findOne({
        queue: queueId,
        status: TokenStatus.WAITING,
      }).sort({ seq: 1 });

      if (!nextToken) {
        return {
          success: false,
          error: "No waiting tokens found in queue",
        };
      }

      // Update token status to served
      nextToken.status = TokenStatus.SERVED;
      await nextToken.save();

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
      const currentToken = await Token.findOne({
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
        { new: true, runValidators: true }
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
        { new: true, runValidators: true }
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
        error: "Failed to resume queue",
      };
    }
  }
}
