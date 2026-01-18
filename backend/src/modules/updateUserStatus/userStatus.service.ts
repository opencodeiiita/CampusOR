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

// Helper: Check if user has an active token (source of truth)
const hasActiveToken = async (userId: string): Promise<boolean> => {
  const activeToken = await Token.findOne({
    userId: new Types.ObjectId(userId),
    status: { $in: [TokenStatus.WAITING, TokenStatus.SERVED] },
  });
  return !!activeToken;
};

// Helper: Get active token for user (source of truth)
const getActiveToken = async (userId: string) => {
  return await Token.findOne({
    userId: new Types.ObjectId(userId),
    status: { $in: [TokenStatus.WAITING, TokenStatus.SERVED] },
  }).sort({ createdAt: -1 });
};

// Helper: Sync currentQueue cache based on Token state
const syncCurrentQueueCache = async (userId: string) => {
  const user = await User.findById(userId);
  if (!user) return;

  const activeToken = await getActiveToken(userId);
  
  if (activeToken) {
    // User has active token, update cache
    if (!user.currentQueue || !user.currentQueue.equals(activeToken.queue)) {
      user.currentQueue = activeToken.queue;
      await user.save();
    }
  } else {
    // No active token, clear cache
    if (user.currentQueue) {
      user.currentQueue = undefined;
      await user.save();
    }
  }
};

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

  // Check Token table as source of truth
  const isInQueue = await hasActiveToken(userId);
  if (isInQueue) {
    throw {
      statusCode: 409,
      message: "You are already in a queue",
    };
  }

  // Generate token with userId
  const token = await Token.create({
    queue: queue._id,
    userId: new Types.ObjectId(userId),
    seq: queue.nextSequence,
    status: TokenStatus.WAITING,
  });

  // Increment queue sequence
  queue.nextSequence += 1;
  await queue.save();

  // Update cache
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
    tokenId: token._id.toString(),
    tokenNumber: `T-${String(token.seq).padStart(3, "0")}`,
  };
};

export const updateCheckInStatus = async ({
  userId,
}: updateCheckInStatusInput) => {
  const user = await User.findById(userId);

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  // Check Token table as source of truth
  const activeToken = await getActiveToken(userId);
  if (!activeToken) {
    throw {
      statusCode: 409,
      message: "User is not currently in a queue",
    };
  }

  const completedQueue = activeToken.queue;

  // Update token status to COMPLETED
  if (activeToken.status === TokenStatus.SERVED) {
    activeToken.status = TokenStatus.COMPLETED;
    await activeToken.save();
  } else if (activeToken.status === TokenStatus.WAITING) {
    // If still waiting, can't complete - token should be served first
    throw {
      statusCode: 409,
      message: "Cannot complete queue while still waiting. Token must be served first.",
    };
  }

  // Get queue info before clearing it (for email)
  const queue = await Queue.findById(completedQueue);

  // Clear cache
  user.currentQueue = undefined;
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
  const user = await User.findById(userId).select("currentQueue");

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  // Check Token table as source of truth
  const activeToken = await getActiveToken(userId);
  const isInQueue = !!activeToken;
  
  // Sync cache if needed
  if (isInQueue && activeToken) {
    if (!user.currentQueue || !user.currentQueue.equals(activeToken.queue)) {
      user.currentQueue = activeToken.queue;
      await user.save();
    }
  } else if (!isInQueue && user.currentQueue) {
    // Clear stale cache
    user.currentQueue = undefined;
    await user.save();
  }

  return {
    isInQueue,
    currentQueue: user.currentQueue ?? null,
  };
};

export const getUserHistory = async ({ userId }: GetUserHistoryInput) => {
  const user = await User.findById(userId);

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  // Get all tokens for this user (excluding active tokens to show only history)
  const allTokens = await Token.find({
    userId: new Types.ObjectId(userId),
    status: { $in: [TokenStatus.COMPLETED, TokenStatus.CANCELLED, TokenStatus.SKIPPED] },
  })
    .sort({ createdAt: -1 }) // Most recent first
    .lean();

  // Get unique queue IDs to fetch queue details
  const queueIds = [...new Set(allTokens.map((token) => token.queue.toString()))];

  // Fetch all queues (no joins - separate queries)
  const queues = await Queue.find({
    _id: { $in: queueIds.map((id) => new Types.ObjectId(id)) },
  }).lean();

  // Create a map for quick queue lookup
  const queueMap = new Map(queues.map((q) => [q._id.toString(), q]));

  // Build history array with all required information
  const history = allTokens.map((token) => {
    const queue = queueMap.get(token.queue.toString());
    const joinedAt = token.createdAt;
    const updatedAt = token.updatedAt;

    // Calculate wait time (time from joined to when status changed)
    // For COMPLETED/SERVED, this is approximate (createdAt to updatedAt)
    // Note: updatedAt reflects last status change, which may not be when it was served
    const waitTimeMs = updatedAt.getTime() - joinedAt.getTime();
    const waitTimeMinutes = Math.round(waitTimeMs / (1000 * 60));

    // Determine when served/cancelled based on status and updatedAt
    let servedAt: Date | null = null;
    let cancelledAt: Date | null = null;

    if (token.status === TokenStatus.COMPLETED || token.status === TokenStatus.SERVED) {
      // updatedAt reflects when status changed to this state
      servedAt = updatedAt;
    } else if (
      token.status === TokenStatus.CANCELLED ||
      token.status === TokenStatus.SKIPPED
    ) {
      cancelledAt = updatedAt;
    }

    return {
      queueId: token.queue.toString(),
      queueName: queue?.name || "Unknown Queue",
      location: queue?.location || "Unknown Location",
      token: `T-${String(token.seq).padStart(3, "0")}`,
      joinedAt: joinedAt.toISOString(),
      servedAt: servedAt ? servedAt.toISOString() : null,
      cancelledAt: cancelledAt ? cancelledAt.toISOString() : null,
      status: token.status,
      waitTimeMinutes,
    };
  });

  return {
    pastQueues: history,
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

  // TODO: pastQueues field removed from User model
  // History can be retrieved from Token table if needed
  // For now, just return success without persisting
  return {
    updated: false,
    message: "History tracking has been removed. Use Token table for history if needed.",
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

  // Check Token table as source of truth
  const activeToken = await getActiveToken(userId);
  if (activeToken) {
    throw {
      statusCode: 409,
      message: "You are already in a queue. Please leave it first.",
    };
  }

  // Generate token with userId
  const token = await Token.create({
    queue: queue._id,
    userId: new Types.ObjectId(userId),
    seq: queue.nextSequence,
    status: TokenStatus.WAITING,
  });

  // Increment queue sequence
  queue.nextSequence += 1;
  await queue.save();

  // Update cache
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
    .select("currentQueue");

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  // Check Token table as source of truth
  const activeToken = await getActiveToken(userId);
  
  if (!activeToken) {
    // No active token, clear cache and return null
    if (user.currentQueue) {
      user.currentQueue = undefined;
      await user.save();
    }
    return null;
  }

  // Sync cache if needed
  if (!user.currentQueue || !user.currentQueue.equals(activeToken.queue)) {
    user.currentQueue = activeToken.queue;
    await user.save();
  }

  // Get queue details
  const queue = await Queue.findById(activeToken.queue);
  if (!queue) {
    // Queue not found, clear cache
    user.currentQueue = undefined;
    await user.save();
    return null;
  }

  // Count position in queue
  const waitingCount = await Token.countDocuments({
    queue: activeToken.queue,
    status: TokenStatus.WAITING,
    seq: { $lt: activeToken.seq },
  });

  return {
    id: activeToken._id.toString(),
    queueId: activeToken.queue.toString(),
    queueName: queue.name,
    location: queue.location,
    tokenNumber: `T-${String(activeToken.seq).padStart(3, "0")}`,
    currentPosition: waitingCount + 1,
    estimatedWaitTime: (waitingCount + 1) * 5,
    joinedAt: activeToken.createdAt.toISOString(),
    status: activeToken.status,
  };
};

// Leave current queue (cancel token)
export const leaveCurrentQueue = async ({ userId }: GetUserStatusInput) => {
  const user = await User.findById(userId);

  if (!user) {
    throw { statusCode: 404, message: "User not found" };
  }

  // Check Token table as source of truth
  const activeToken = await getActiveToken(userId);
  
  if (!activeToken) {
    throw { statusCode: 409, message: "You are not in a queue" };
  }

  const queueId = activeToken.queue.toString();

  // Update token status to cancelled/skipped
  // Only cancel waiting tokens, not served ones
  if (activeToken.status === TokenStatus.WAITING) {
    activeToken.status = TokenStatus.CANCELLED;
    await activeToken.save();
  } else {
    // If token is SERVED, can't leave - need to complete it first
    throw { 
      statusCode: 409, 
      message: "Cannot leave queue while being served. Please complete your service first." 
    };
  }

  // Clear cache
  user.currentQueue = undefined;
  await user.save();

  return {
    message: "Successfully left the queue",
    queueId,
  };
};
