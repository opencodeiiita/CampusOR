import { Router } from "express";
import {
  sendQueueDelayedEmail,
  sendQueueAlmostReadyEmail,
  sendQueueReadyEmail,
} from "./email.controller.js";
import { authorize, verifyJWT } from "../../middlewares/auth.js";

const notificationRouter = Router();

notificationRouter.use(verifyJWT, authorize("operator", "admin"));

notificationRouter.post("/queue/delayed", sendQueueDelayedEmail);

notificationRouter.post("/queue/almost-ready", sendQueueAlmostReadyEmail);

notificationRouter.post("/queue/ready", sendQueueReadyEmail);

export default notificationRouter;
