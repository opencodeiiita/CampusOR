import { Queue, IQueue } from "../queue/queue.model.js";
import { Types } from "mongoose";

export interface QueueFilters {
  operator?: string;
  location?: string;
  isActive?: boolean;
}

export interface QueueResponse {
  _id: Types.ObjectId;
  name: string;
  location: string;
  isActive: boolean;
  nextSequence: number;
  operator?: {
    _id: Types.ObjectId;
    name: string;
    email: string;
    role: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

class FetchQueueDataService {
  /**
   * Fetch all queues with optional filters and operator population
   */
  async fetchAllQueues(filters: QueueFilters = {}): Promise<QueueResponse[]> {
    try {
      const query: any = {};

      // Build dynamic query based on provided filters
      if (filters.operator) {
        if (!Types.ObjectId.isValid(filters.operator)) {
          throw new Error("Invalid operator ID format");
        }
        query.operator = new Types.ObjectId(filters.operator);
      }

      if (filters.location) {
        query.location = { $regex: filters.location, $options: "i" }; // Case-insensitive search
      }

      if (filters.isActive !== undefined) {
        query.isActive = filters.isActive;
      }

      const queues = await Queue.find(query)
        .populate({
          path: "operator",
          select: "name email role",
          match: filters.operator ? { _id: filters.operator } : undefined,
        })
        .exec();

      return queues.map(this.formatQueueResponse);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(`Failed to fetch queues: ${errorMessage}`);
    }
  }

  /**
   * Fetch queues created by a specific operator
   */
  async fetchQueuesByOperator(operatorId: string): Promise<QueueResponse[]> {
    try {
      if (!Types.ObjectId.isValid(operatorId)) {
        throw new Error("Invalid operator ID format");
      }

      const queues = await Queue.find({
        operator: new Types.ObjectId(operatorId),
      })
        .populate({
          path: "operator",
          select: "name email role",
        })
        .exec();

      return queues.map(this.formatQueueResponse);
    } catch (error: any) {
      throw new Error(`Failed to fetch queues by operator: ${error.message}`);
    }
  }

  /**
   * Fetch queues by location
   */
  async fetchQueuesByLocation(location: string): Promise<QueueResponse[]> {
    try {
      if (!location || location.trim() === "") {
        throw new Error("Location is required");
      }

      const queues = await Queue.find({
        location: { $regex: location.trim(), $options: "i" },
      })
        .populate({
          path: "operator",
          select: "name email role",
        })
        .exec();

      return queues.map(this.formatQueueResponse);
    } catch (error: any) {
      throw new Error(`Failed to fetch queues by location: ${error.message}`);
    }
  }

  /**
   * Fetch queues by both operator and location
   */
  async fetchQueuesByOperatorAndLocation(
    operatorId: string,
    location: string
  ): Promise<QueueResponse[]> {
    try {
      if (!Types.ObjectId.isValid(operatorId)) {
        throw new Error("Invalid operator ID format");
      }

      if (!location || location.trim() === "") {
        throw new Error("Location is required");
      }

      const queues = await Queue.find({
        operator: new Types.ObjectId(operatorId),
        location: { $regex: location.trim(), $options: "i" },
      })
        .populate({
          path: "operator",
          select: "name email role",
        })
        .exec();

      return queues.map(this.formatQueueResponse);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      throw new Error(
        `Failed to fetch queues by operator and location: ${errorMessage}`
      );
    }
  }

  /**
   * Format queue response for consistent API output
   */
  private formatQueueResponse(queue: any): QueueResponse {
    const response: QueueResponse = {
      _id: queue._id,
      name: queue.name,
      location: queue.location,
      isActive: queue.isActive,
      nextSequence: queue.nextSequence,
      createdAt: queue.createdAt,
      updatedAt: queue.updatedAt,
    };

    // Add operator details if populated and exists
    if (queue.operator) {
      response.operator = {
        _id: queue.operator._id,
        name: queue.operator.name,
        email: queue.operator.email,
        role: queue.operator.role,
      };
    }

    return response;
  }
}

export const fetchQueueDataService = new FetchQueueDataService();
