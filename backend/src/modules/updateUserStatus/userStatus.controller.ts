import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import {
  checkInQueue as checkInQueueService,
  updateCheckInStatus as updateCheckInStatusService,
  getUserStatus as getUserStatusService,
  getUserHistory,
  updateUserHistory,
  joinQueueWithToken,
  getCurrentQueueDetails,
  leaveCurrentQueue,
  performCheckIn,
} from "./userStatus.service.js";
import { broadcastQueueUpdate } from "../../server/socket.js";

export const checkInQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub; // from auth

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const { queueId } = req.body;

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: "Queue ID is required",
      });
    }

    const result = await checkInQueueService({
      userId,
      queueId,
    });

    // Broadcast the queue update
    await broadcastQueueUpdate(queueId);

    return res.status(200).json({
      success: true,
      message: result.message,
      currentQueue: result.currentQueue,
      tokenId: result.tokenId,
      tokenNumber: result.tokenNumber,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const updateCheckInStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await updateCheckInStatusService({ userId });

    // Broadcast the queue update
    if (result.completedQueue) {
      await broadcastQueueUpdate(result.completedQueue.toString());
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      completedQueue: result.completedQueue,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const getUserStatus = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const status = await getUserStatusService({ userId });

    return res.status(200).json({
      success: true,
      isInQueue: status.isInQueue,
      currentQueue: status.currentQueue,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const getHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getUserHistory({ userId });

    return res.status(200).json({
      success: true,
      data: result.pastQueues,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

export const updateHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { queueId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: "Queue ID is required",
      });
    }

    const result = await updateUserHistory({
      userId,
      queueId,
    });

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

// Join queue and generate token
export const joinQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    const { queueId } = req.body;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (!queueId) {
      return res.status(400).json({
        success: false,
        message: "Queue ID is required",
      });
    }

    const result = await joinQueueWithToken({ userId, queueId });

    // Broadcast the queue update
    await broadcastQueueUpdate(queueId);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

// Get current queue details with token info
export const getCurrentQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await getCurrentQueueDetails({ userId });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

// Leave current queue (cancel token)
export const leaveQueue = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const result = await leaveCurrentQueue({ userId });

    // Broadcast the queue update
    if (result.queueId) {
      await broadcastQueueUpdate(result.queueId);
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

// --- New Endpoints ---

export const getNotifications = async (req: AuthRequest, res: Response) => {
  // TODO: Implement real notification persistence
  // For now, return empty list or mock to assume "no notifications" or unblock frontend
  return res.status(200).json({
    success: true,
    data: [],
  });
};

export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  // TODO: Implement read logic
  return res.status(200).json({
    success: true,
  });
};

export const getUserState = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Re-use logic from getUserStatus but format for 'UserQueueService.getUserState'
    const status = await getUserStatusService({ userId });

    return res.status(200).json({
      success: true,
      data: {
        userId,
        isInQueue: status.isInQueue,
        queueId: status.currentQueue?.toString(),
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserStats = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    const result = await getUserHistory({ userId });
    const pastQueues = result.pastQueues || [];

    // Calculate basic stats on the fly
    const totalQueuesJoined = pastQueues.length;
    const totalServed = pastQueues.filter(q => q.status === 'served').length;
    const totalCancelled = pastQueues.filter(q => q.status === 'cancelled').length;
    const totalWaitTime = pastQueues.reduce((acc, q) => acc + (q.waitTimeMinutes || 0), 0);
    const averageWaitTime = totalQueuesJoined > 0 ? Math.round(totalWaitTime / totalQueuesJoined) : 0;

    return res.status(200).json({
      success: true,
      data: {
        totalQueuesJoined,
        averageWaitTime,
        totalServed,
        totalCancelled,
        thisMonthQueues: totalQueuesJoined // Simplified for now
      }
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const checkIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });

    // Use the renamed/new service method
    const result = await performCheckIn({ userId });

    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(err.statusCode || 500).json({ success: false, message: err.message || "Failed to check in" });
  }
};
