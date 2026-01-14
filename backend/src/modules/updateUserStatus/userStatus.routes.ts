import { Router } from "express";
import {
  checkInQueue,
  updateCheckInStatus,
  getUserStatus,
  getHistory,
  joinQueue,
  getCurrentQueue,
  leaveQueue,
} from "./userStatus.controller.js";

const userStatusRouter = Router();

// Legacy endpoints
userStatusRouter.get("/", getUserStatus);
userStatusRouter.post("/check-in-queue", checkInQueue);
userStatusRouter.post("/update-check-in-status", updateCheckInStatus);
userStatusRouter.get("/history", getHistory);

// New user endpoints for real-time queue management
userStatusRouter.post("/join-queue", joinQueue);
userStatusRouter.get("/current-queue", getCurrentQueue);
userStatusRouter.post("/leave-queue", leaveQueue);

export default userStatusRouter;
