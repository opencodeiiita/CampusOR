import { Router } from "express";
import authRouter from "../modules/auth/auth.routes.js";
import queueRouter from "../modules/queue/queue.routes.js";
import userStatusRouter from "../modules/updateUserStatus/userStatus.routes.js";
import { verifyJWT, authorize } from "../middlewares/auth.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/queues", queueRouter);
router.use("/user-status", verifyJWT, userStatusRouter);

export default router;
