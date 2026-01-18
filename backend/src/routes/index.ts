import { Router } from "express";
import { verifyJWT, authorize } from "../middlewares/auth.js";
import authRouter from "../modules/auth/auth.routes.js";
import queueRouter from "../modules/queue/queue.routes.js";
import operatorRouter from "../modules/operator/operator.routes.js";
import adminRouter from "../modules/admin/admin.routes.js";
import notificationRouter from "../modules/notifications/email.route.js";
import fetchQueueDataRouter from "../modules/fetchQueueData/fetchQueueData.route.js";
import userStatusRouter from "../modules/updateUserStatus/userStatus.routes.js";


const router = Router();


router.use("/auth", authRouter);
router.use("/queues", queueRouter);
router.use("/operator", operatorRouter);
router.use("/operators", operatorRouter); // alias stays
router.use("/admin", adminRouter);
router.use("/notifications", notificationRouter);
router.use("/queue-data", fetchQueueDataRouter);
router.use("/user-status",
  verifyJWT,
  userStatusRouter
);

export default router;
