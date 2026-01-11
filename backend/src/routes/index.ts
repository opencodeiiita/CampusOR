import { Router } from "express";
import authRouter from "../modules/auth/auth.routes.js";
import queueRouter from "../modules/queue/queue.routes.js";
import operatorRouter from "../modules/operator/operator.routes.js";

const router = Router();

router.use("/auth", authRouter);
router.use("/queues", queueRouter);
router.use("/operator", operatorRouter);

export default router;
