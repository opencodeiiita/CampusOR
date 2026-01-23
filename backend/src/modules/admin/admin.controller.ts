import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import * as adminService from "./admin.service.js";
import { User } from "../auth/user.model.js";
import { AuthError } from "../auth/auth.service.js";

/**
 * Admin Controllers
 * All endpoints are protected by verifyJWT + authorize("admin") middleware
 */
// Example admin endpoint - Dashboard
export const getDashboard = (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    message: "Welcome to admin dashboard",
    user: {
      id: req.user?.sub,
      role: req.user?.role,
    },
  });
};

/**
 * Get a list of all the admins
 */
export const getAdmins = async (req: AuthRequest, res: Response) => {
  try {
    const admins = await User.find({ role: "admin" })
      .select("_id name email emailVerified createdByAdmin createdAt")
      .populate("createdByAdmin", "email name")
      .sort({ createdAt: 1 }); // bootstrap admin first

    return res.status(200).json(admins);
  } catch (error) {
    console.error("Failed to fetch admins:", error);
    return res.status(500).json({
      message: "Failed to fetch admins",
    });
  }
};


/**
 * GET /api/admin/dashboard/summary
 * Returns overview metrics for admin dashboard
 */
export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const summary = await adminService.getDashboardSummary();
    return res.status(200).json(summary);
  } catch (error) {
    console.error("Error fetching dashboard summary:", error);
    return res.status(500).json({
      message: "Failed to fetch dashboard summary",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/analytics/queue-load
 * Returns active tokens per hour throughout the day
 */
export const getQueueLoadAnalytics = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const queueLoad = await adminService.getQueueLoadOverTime();
    return res.status(200).json(queueLoad);
  } catch (error) {
    console.error("Error fetching queue load analytics:", error);
    return res.status(500).json({
      message: "Failed to fetch queue load data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/analytics/tokens-served
 * Returns count of tokens served per hour
 */
export const getTokensServedAnalytics = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const tokensServed = await adminService.getTokensServedPerHour();
    return res.status(200).json(tokensServed);
  } catch (error) {
    console.error("Error fetching tokens served analytics:", error);
    return res.status(500).json({
      message: "Failed to fetch tokens served data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/analytics/avg-wait-time
 * Returns average wait time per queue
 */
export const getAvgWaitTimeAnalytics = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const waitTimes = await adminService.getAvgWaitTimePerQueue();
    return res.status(200).json(waitTimes);
  } catch (error) {
    console.error("Error fetching wait time analytics:", error);
    return res.status(500).json({
      message: "Failed to fetch wait time data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * GET /api/admin/analytics/token-status
 * Returns distribution of tokens by status
 */
export const getTokenStatusAnalytics = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const statusDistribution = await adminService.getTokenStatusDistribution();
    return res.status(200).json(statusDistribution);
  } catch (error) {
    console.error("Error fetching token status analytics:", error);
    return res.status(500).json({
      message: "Failed to fetch token status data",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Send Admin Invite
 */
export const sendAdminInvite = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;
    const inviterId = req.user?.sub;
    
    if (!inviterId) {
       return res.status(401).json({ message: "Unauthorized" });
    }

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const inviter = await User.findById(inviterId);
    if (!inviter) {
       return res.status(401).json({ message: "Inviter not found" });
    }

    const result = await adminService.createInvite(email, inviterId, inviter.name);
    
    return res.status(200).json(result);
  } catch (error: any) {
    const status = error instanceof AuthError ? error.status : 400;
    return res.status(status).json({
      message: error.message || "Failed to send invite",
    });
  }
};
