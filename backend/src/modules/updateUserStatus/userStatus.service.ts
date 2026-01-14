import { User } from "../auth/user.model.js";
import { Queue, Token, TokenStatus } from "../queue/queue.model.js";
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
  if (!user.pastQueues.some((q) => q.equals(completedQueue))) {
    user.pastQueues.push(completedQueue);
  }

  // Clear active queue
  user.currentQueue = undefined;
  user.isInQueue = false;

  await user.save();

  // Send queue finished email (non-blocking)
  if (queue) {
    sendQueueFinishedEmail(
      user.email,
      user.name,
      queue.name,
      queue.location
    ).catch((error) => {
      console.error("Failed to send queue finished email:", error);
    });
  }

  return {
    message: "Queue completed successfully",
    completedQueue,
  };
};

export const getUserStatus = async ({ userId }: GetUserStatusInput) => {
  const user = await User.findById(userId).select("isInQueue currentQueue");

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

  const alreadyExists = user.pastQueues.some((q) => q.equals(queueId));

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
// Join queue and generate token
export const joinQueueWithToken = async ({
  userId,
  queueId,
}: CheckInQueueInput) => {
  if (!Types.ObjectId.isValid(queueId)) {
    throw { statusCode: 400, message: "Invalid queue ID" };
  }

  const queue = await Queue.findById(queueId);
  if (!queue) {
    throw { statusCode: 404, message: "Queue not found" };
  }

  if (!queue.isActive) {
    throw { statusCode: 400, message: "Queue is not active" };
  }

  const user = await User.findById(userId);
  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  // Check if user has an active token in any queue
  if (user.isInQueue && user.currentQueue) {
    // Verify if there's actually an active token
    const activeToken = await Token.findOne({
      queue: user.currentQueue,
      status: TokenStatus.WAITING,
    }).sort({ createdAt: -1 });

    if (activeToken) {
      throw {
        statusCode: 409,
        message: "You are already in a queue. Please leave it first.",
      };
    } else {
      // No active token found, clear stale user state
      user.isInQueue = false;
      user.currentQueue = undefined;
      await user.save();
    }
  }

  // Generate token
  const token = await Token.create({
    queue: queue._id,
    seq: queue.nextSequence,
    status: TokenStatus.WAITING,
  });

  // Increment queue sequence
  queue.nextSequence += 1;
  await queue.save();

  // Update user status
  user.isInQueue = true;
  user.currentQueue = queue._id;
  await user.save();

  // Send email notification
  sendQueueJoinedEmail(user.email, user.name, queue.name, queue.location).catch(
    (error) => {
      console.error("Failed to send queue joined email:", error);
    }
  );

  // Count waiting tokens for position
  const waitingCount = await Token.countDocuments({
    queue: queue._id,
    status: TokenStatus.WAITING,
    seq: { $lt: token.seq },
  });

  return {
    id: token._id.toString(),
    queueId: queue._id.toString(),
    queueName: queue.name,
    location: queue.location,
    tokenNumber: `T-${String(token.seq).padStart(3, "0")}`,
    currentPosition: waitingCount + 1,
    estimatedWaitTime: (waitingCount + 1) * 5, // 5 mins per person
    joinedAt: token.createdAt.toISOString(),
    status: token.status,
  };
};

// Get current queue details with token
export const getCurrentQueueDetails = async ({
  userId,
}: GetUserStatusInput) => {
  const user = await User.findById(userId)
    .populate("currentQueue")
    .select("isInQueue currentQueue");

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  if (!user.isInQueue || !user.currentQueue) {
    return null;
  }

  const queue = user.currentQueue as any;

  // Find user's latest token in this queue
  // Since Token doesn't have userId, we find by queue and most recent creation
  // This assumes user can only have one active token per queue
  const token = await Token.findOne({
    queue: queue._id,
    status: { $in: [TokenStatus.WAITING, TokenStatus.SERVED] },
  }).sort({ createdAt: -1 });

  if (!token) {
    // Token not found or completed, clear user's queue status
    user.isInQueue = false;
    user.currentQueue = undefined;
    await user.save();
    return null;
  }

  // If token is completed, clear user state and return null
  if (token.status === TokenStatus.COMPLETED) {
    user.isInQueue = false;
    user.currentQueue = undefined;
    await user.save();
    return null;
  }

  // Count position in queue
  const waitingCount = await Token.countDocuments({
    queue: queue._id,
    status: TokenStatus.WAITING,
    seq: { $lt: token.seq },
  });

  return {
    id: token._id.toString(),
    queueId: queue._id.toString(),
    queueName: queue.name,
    location: queue.location,
    tokenNumber: `T-${String(token.seq).padStart(3, "0")}`,
    currentPosition: waitingCount + 1,
    estimatedWaitTime: (waitingCount + 1) * 5,
    joinedAt: token.createdAt.toISOString(),
    status: token.status,
  };
};

// Leave current queue (cancel token)
export const leaveCurrentQueue = async ({ userId }: GetUserStatusInput) => {
  const user = await User.findById(userId);

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  if (!user.isInQueue || !user.currentQueue) {
    throw { statusCode: 409, message: "You are not in a queue" };
  }

  const queueId = user.currentQueue.toString();

  // Find and cancel the user's most recent waiting token in this queue
  // Since Token doesn't have userId, we find by queue and most recent waiting token
  await Token.findOneAndUpdate(
    {
      queue: user.currentQueue,
      status: TokenStatus.WAITING,
    },
    {
      status: TokenStatus.SKIPPED, // Mark as skipped/cancelled
    },
    { sort: { createdAt: -1 } } // Get the most recent waiting token
  );

  // Clear user status
  user.isInQueue = false;
  user.currentQueue = undefined;
  await user.save();

  return {
    message: "Successfully left the queue",
    queueId,
  };
};
