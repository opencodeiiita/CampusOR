import { Request, Response, NextFunction } from "express";
import {
  fetchQueueDataService,
  QueueFilters,
} from "./fetchQueueData.service.js";

class FetchQueueDataController {
  /**
   * Fetch all queues with optional filters
   * GET /api/queues?operator=xxx&location=xxx&isActive=xxx
   */
  async getAllQueues(req: Request, res: Response, next: NextFunction) {
    try {
      const filters: QueueFilters = {
        operator: req.query.operator as string,
        location: req.query.location as string,
        isActive: req.query.isActive
          ? req.query.isActive === "true"
          : undefined,
      };

      const queues = await fetchQueueDataService.fetchAllQueues(filters);

      res.status(200).json({
        success: true,
        data: {
          queues,
          count: queues.length,
          filters: Object.keys(filters).filter(
            (key) => filters[key as keyof QueueFilters] !== undefined
          ),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch queues by operator ID
   * GET /api/queues/operator/:operatorId
   */
  async getQueuesByOperator(req: Request, res: Response, next: NextFunction) {
    try {
      const { operatorId } = req.params;

      const queues = await fetchQueueDataService.fetchQueuesByOperator(
        operatorId
      );

      res.status(200).json({
        success: true,
        data: {
          queues,
          count: queues.length,
          operatorId,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch queues by location
   * GET /api/queues/location/:location
   */
  async getQueuesByLocation(req: Request, res: Response, next: NextFunction) {
    try {
      const { location } = req.params;

      const queues = await fetchQueueDataService.fetchQueuesByLocation(
        location
      );

      res.status(200).json({
        success: true,
        data: {
          queues,
          count: queues.length,
          location,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Fetch queues by both operator and location
   * GET /api/queues/operator/:operatorId/location/:location
   */
  async getQueuesByOperatorAndLocation(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { operatorId, location } = req.params;

      const queues =
        await fetchQueueDataService.fetchQueuesByOperatorAndLocation(
          operatorId,
          location
        );

      res.status(200).json({
        success: true,
        data: {
          queues,
          count: queues.length,
          operatorId,
          location,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

export const fetchQueueDataController = new FetchQueueDataController();
