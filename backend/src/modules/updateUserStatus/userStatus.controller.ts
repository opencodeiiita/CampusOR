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
