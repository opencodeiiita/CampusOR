import { Router } from "express";
import { checkInQueue, updateCheckInStatus, getUserStatus, getHistory,  } from "./userStatus.controller.js";

const userStatusRouter = Router();

userStatusRouter.get("/", getUserStatus)
userStatusRouter.post("/check-in-queue", checkInQueue);
userStatusRouter.post("/update-check-in-status", updateCheckInStatus);

userStatusRouter.get("/history", getHistory);
userStatusRouter.post("/updateHistory", )

export default userStatusRouter;
