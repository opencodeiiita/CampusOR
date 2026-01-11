import { User } from "../auth/user.model.js";
import { Queue } from "../queue/queue.model.js";
import { Types } from "mongoose";
import {
  sendQueueJoinedEmail,
  sendQueueFinishedEmail,
} from "../notifications/email.service.js";

interface CheckInQueueInput {
    userId: string;
    queueId: string;
}

interface updateCheckInStatusInput {
    userId: string;
}

interface GetUserStatusInput {
  userId: string;
}

interface GetUserHistoryInput {
    userId: string;
  }
  

  interface UpdateUserHistoryInput {
    userId: string;
    queueId: string;
  }


export const checkInQueue = async ({ userId, queueId }: CheckInQueueInput) => {
    if (!Types.ObjectId.isValid(queueId)) {
        throw { statusCode: 400, message: "Invalid queue ID" };
    }

    const queue = await Queue.findById(queueId);
    if (!queue) {
        throw { statusCode: 404, message: "Queue not found" };
    }

    const user = await User.findById(userId);
    if (!user) {
        throw { statusCode: 404, message: "User not found" };
    }

    if (user.isInQueue) {
        throw {
            statusCode: 409,
            message: "You are already in a queue",
        };
    }

    user.isInQueue = true;
    user.currentQueue = queue._id;
    await user.save();

    // Send queue joined email (non-blocking)
    sendQueueJoinedEmail(user.email, user.name, queue.name, queue.location).catch(
      (error) => {
        console.error("Failed to send queue joined email:", error);
      }
    );

    return {
        message: "Successfully joined the queue",
        currentQueue: queueId,
    };
};

export const updateCheckInStatus = async ({
    userId,
}: updateCheckInStatusInput) => {
    const user = await User.findById(userId);

    if (!user) {
        throw { statusCode: 404, message: "User not found" };
    }

    if (!user.isInQueue || !user.currentQueue) {
        throw {
            statusCode: 409,
            message: "User is not currently in a queue",
        };
    }

    const completedQueue = user.currentQueue;

    // Get queue info before clearing it (for email)
    const queue = await Queue.findById(completedQueue);

    // Prevent duplicate history entries
    user.pastQueues = user.pastQueues || [];
    if (!user.pastQueues.some(q => q.equals(completedQueue))) {
        user.pastQueues.push(completedQueue);
    }

    // Clear active queue
    user.currentQueue = undefined;
    user.isInQueue = false;

    await user.save();

    // Send queue finished email (non-blocking)
    if (queue) {
      sendQueueFinishedEmail(user.email, user.name, queue.name, queue.location).catch(
        (error) => {
          console.error("Failed to send queue finished email:", error);
        }
      );
    }

    return {
        message: "Queue completed successfully",
        completedQueue,
    };
};

export const getUserStatus = async ({ userId }: GetUserStatusInput) => {
    const user = await User.findById(userId).select(
      "isInQueue currentQueue"
    );
  
    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }
  
    return {
      isInQueue: user.isInQueue ?? false,
      currentQueue: user.currentQueue ?? null,
    };
  };
  

  export const getUserHistory = async ({ userId }: GetUserHistoryInput) => {
    const user = await User.findById(userId)
      .populate({
        path: "pastQueues",
        select: "name status", // select only what frontend needs
      })
      .select("pastQueues");
  
    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }
  
    return {
      pastQueues: user.pastQueues || [],
    };
  };

  export const updateUserHistory = async ({
    userId,
    queueId,
  }: UpdateUserHistoryInput) => {
    if (!Types.ObjectId.isValid(queueId)) {
      throw { statusCode: 400, message: "Invalid queue ID" };
    }
  
    const user = await User.findById(userId);
  
    if (!user) {
      throw { statusCode: 404, message: "User not found" };
    }
  
    user.pastQueues = user.pastQueues || [];
  
    const alreadyExists = user.pastQueues.some((q) =>
      q.equals(queueId)
    );
  
    if (alreadyExists) {
      return {
        updated: false,
        message: "Queue already exists in history",
      };
    }
  
    user.pastQueues.push(new Types.ObjectId(queueId));
    await user.save();
  
    // 📧 Email hook (DO NOT misuse existing emails)
    // TODO: sendQueueHistoryUpdatedEmail(user.email, queueId)
  
    return {
      updated: true,
      message: "Queue added to history",
    };
  };
  