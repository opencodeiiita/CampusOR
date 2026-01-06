import { Router } from "express";
import {
  sendQueueDelayedEmail,
  sendQueueAlmostReadyEmail,
  sendQueueReadyEmail,
} from "./email.controller.js";

const notificationRouter = Router();

notificationRouter.post("/queue/delayed", sendQueueDelayedEmail);

notificationRouter.post("/queue/almost-ready", sendQueueAlmostReadyEmail);

notificationRouter.post("/queue/ready", sendQueueReadyEmail);

export default notificationRouter;
