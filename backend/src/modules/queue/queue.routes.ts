import { Router } from "express";

import {
  createQueue,
  generateToken,
  updateTokenStatus,
  getQueueOperatorView,
  getQueuesForUsers,
  getPredictedWaitTime,
} from "./queue.controller.js";
import { verifyJWT, authorize } from "../../middlewares/auth.js";

const router = Router();
// ML-powered predicted wait time endpoint
router.get("/:queueId/predicted-wait", getPredictedWaitTime);

// Public endpoint to get all queues for users
router.get("/", getQueuesForUsers);

// queues
// Only operators and admins can create queues
router.post("/", verifyJWT, authorize("operator", "admin"), createQueue);

// Get the unified view for the operator dashboard
router.get(
  "/:queueId/operator-view",
  verifyJWT,
  authorize("operator", "admin"),
  getQueueOperatorView,
);

// tokens
// Authenticated endpoint for users to get a token (rate limited per user)
router.post("/:queueId/tokens", verifyJWT, generateToken);

// Only operators/admins can update status (serve/skip)
router.patch(
  "/tokens/:tokenId/status",
  verifyJWT,
  authorize("operator", "admin"),
  updateTokenStatus,
);

export default router;
