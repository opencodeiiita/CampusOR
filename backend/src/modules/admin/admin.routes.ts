import { Router } from "express";
import { verifyJWT, authorize } from "../../middlewares/auth.js";
import {
  getDashboard,
  getDashboardSummary,
  getQueueLoadAnalytics,
  getTokensServedAnalytics,
  getAvgWaitTimeAnalytics,
  getTokenStatusAnalytics,
} from "./admin.controller.js";

const router = Router();

/**
 * All routes are protected by verifyJWT + authorize("admin")
 */

// Example protected admin endpoint
router.get("/dashboard", verifyJWT, authorize("admin"), getDashboard);

// Dashboard Summary - Overview metrics
router.get(
  "/dashboard/summary",
  verifyJWT,
  authorize("admin"),
  getDashboardSummary
);

// Analytics Endpoints
router.get(
  "/analytics/queue-load",
  verifyJWT,
  authorize("admin"),
  getQueueLoadAnalytics
);

router.get(
  "/analytics/tokens-served",
  verifyJWT,
  authorize("admin"),
  getTokensServedAnalytics
);

router.get(
  "/analytics/avg-wait-time",
  verifyJWT,
  authorize("admin"),
  getAvgWaitTimeAnalytics
);

router.get(
  "/analytics/token-status",
  verifyJWT,
  authorize("admin"),
  getTokenStatusAnalytics
);

export default router;
