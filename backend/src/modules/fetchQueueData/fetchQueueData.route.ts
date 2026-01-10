import { Router } from "express";
import { fetchQueueDataController } from "./fetchQueueData.controller.js";

const router = Router();

/**
 * GET /api/queues
 * Fetch all queues with optional filters
 * Query parameters: operator, location, isActive
 */
router.get("/", fetchQueueDataController.getAllQueues);

/**
 * GET /api/queues/operator/:operatorId
 * Fetch queues created by a specific operator
 */
router.get(
  "/operator/:operatorId",
  fetchQueueDataController.getQueuesByOperator
);

/**
 * GET /api/queues/location/:location
 * Fetch queues by location
 */
router.get("/location/:location", fetchQueueDataController.getQueuesByLocation);

/**
 * GET /api/queues/operator/:operatorId/location/:location
 * Fetch queues by both operator and location
 */
router.get(
  "/operator/:operatorId/location/:location",
  fetchQueueDataController.getQueuesByOperatorAndLocation
);

export default router;
