import { Request, Response } from "express";
import { Queue, TokenStatus } from "./queue.model.js";
import { TokenService } from "./services/token.service.js";

// 1: Create a new queue
export async function createQueue(req: Request, res: Response) {
  try {
    const { name, operator } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Queue name is required",
      });
    }

    const queue = await Queue.create({
      name,
      operator: operator || null, // ✅ optional
    });

    return res.status(201).json({
      success: true,
      queue: {
        id: queue._id,
        name: queue.name,
        isActive: queue.isActive,
        operator: queue.operator,
        createdAt: queue.createdAt,
      },
    });
  } catch {
    return res.status(500).json({
      success: false,
      error: "Failed to create queue",
    });
  }
}

// 2: Generate token for a user in a queue
export async function generateToken(req: Request, res: Response) {
  const { queueId } = req.params;

  const result = await TokenService.generateToken(queueId);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(201).json(result);
}

// 3: Update token status
export async function updateTokenStatus(req: Request, res: Response) {
  const { tokenId } = req.params;
  const { status } = req.body;

  if (!Object.values(TokenStatus).includes(status)) {
    return res.status(400).json({
      success: false,
      error: "Invalid token status",
    });
  }

  const result = await TokenService.updateStatus(tokenId, status);

  if (!result.success) {
    return res.status(400).json(result);
  }

  return res.status(200).json(result);
}
