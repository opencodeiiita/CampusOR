import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";
import { generateQueueService } from "./generateQueue.service.js";

export const generateQueue = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Queue name is required",
      });
    }

    // ✅ operator id from JWT
    const operatorId = req.user!.sub;

    const queue = await generateQueueService(name, operatorId);

    return res.status(201).json({
      message: "Queue created successfully",
      queue,
    });
  } catch (error: any) {
    return res.status(500).json({
      message: "Failed to generate queue",
      error: error.message,
    });
  }
};
