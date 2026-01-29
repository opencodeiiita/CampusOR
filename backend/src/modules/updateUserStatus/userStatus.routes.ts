import { Router } from "express";
import {
  checkInQueue,
  updateCheckInStatus,
  getUserStatus,
  getHistory,
  joinQueue,
  getCurrentQueue,
  leaveQueue,
  getNotifications,
  markNotificationAsRead,
  getUserState,
  getUserStats,
  checkIn,
} from "./userStatus.controller.js";

const userStatusRouter = Router();

// Legacy endpoints
userStatusRouter.get("/", getUserStatus);
userStatusRouter.post("/check-in-queue", checkInQueue);
userStatusRouter.post("/update-check-in-status", updateCheckInStatus);
userStatusRouter.get("/history", getHistory);

// New user endpoints for real-time queue management
userStatusRouter.post("/join-queue", joinQueue);
userStatusRouter.post("/check-in", checkIn);
userStatusRouter.get("/current-queue", getCurrentQueue);
userStatusRouter.post("/leave-queue", leaveQueue);

// Notifications and Stats
userStatusRouter.get("/notifications", getNotifications);
userStatusRouter.put("/notifications/:id/read", markNotificationAsRead);
userStatusRouter.get("/state", getUserState);
userStatusRouter.get("/stats", getUserStats);

export default userStatusRouter;
