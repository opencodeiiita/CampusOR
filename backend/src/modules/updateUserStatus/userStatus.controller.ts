import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import {
    checkInQueue as checkInQueueService,
    updateCheckInStatus as updateCheckInStatusService,
    getUserStatus as getUserStatusService,
    getUserHistory,
    updateUserHistory
} from "./userStatus.service.js";

export const checkInQueue = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.sub;        // from auth

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

        return res.status(200).json({
            success: true,
            message: result.message,
            currentQueue: result.currentQueue,
        });
    } catch (err: any) {
        return res.status(err.statusCode || 500).json({
            success: false,
            message: err.message || "Something went wrong",
        });
    }
}

export const updateCheckInStatus = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        const userId = req.user?.sub;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const result = await updateCheckInStatusService({ userId });

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

export const getUserStatus = async (
    req: AuthRequest,
    res: Response
) => {
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
