import { Request, Response } from "express";
import { Queue, Token, TokenStatus } from "./queue.model.js";
import { TokenService } from "./services/token.service.js";

// 1: Create a new queue
export async function createQueue(req: Request, res: Response) {
  try {
    const { name, location, operator } = req.body;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: "Queue name and location are required",
      });
    }

    // Check for existing queue with same name AND location
    const existingQueue = await Queue.findOne({ name, location });
    if (existingQueue) {
      return res.status(409).json({
        success: false,
        error: "A queue with this name already exists at this location",
      });
    }

    const queue = await Queue.create({
      name,
      location,
      operator: operator || null, // optional
      isActive: true, // Default to Active
    });

    return res.status(201).json({
      success: true,
      queue: {
        id: queue._id,
        name: queue.name,
        location: queue.location,
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

// 4: Get Operator View (Queue State + Tokens) -- NEW for Issue #131
export async function getOperatorView(req: Request, res: Response) {
  try {
    const { queueId } = req.params;

    const queue = await Queue.findById(queueId);
    if (!queue) {
      return res.status(404).json({ success: false, error: "Queue not found" });
    }

    // Fetch waiting tokens sorted by sequence
    const tokens = await Token.find({ queue: queueId, status: TokenStatus.WAITING })
      .sort({ seq: 1 })
      .limit(50); 

    // Find the most recently served token (Now Serving)
    const nowServing = await Token.findOne({ queue: queueId, status: TokenStatus.SERVED })
      .sort({ updatedAt: -1 });

    return res.json({
      success: true,
      queue: {
        id: queue._id,
        name: queue.name,
        location: queue.location,
        isActive: queue.isActive,
        nextSequence: queue.nextSequence
      },
      tokens: tokens.map(t => ({ id: t._id, number: t.seq, status: t.status })),
      nowServing: nowServing ? { id: nowServing._id, number: nowServing.seq } : null
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to fetch operator view" });
  }
}

// 5: Toggle Queue Status (Pause/Resume) -- NEW for Issue #131
export async function toggleQueue(req: Request, res: Response) {
  try {
    const { queueId } = req.params;
    const queue = await Queue.findById(queueId);
    
    if (!queue) return res.status(404).json({ success: false, error: "Queue not found" });

    // Toggle status
    queue.isActive = !queue.isActive;
    await queue.save();

    return res.json({ 
      success: true, 
      status: queue.isActive ? "ACTIVE" : "PAUSED", 
      queue: {
        id: queue._id,
        name: queue.name,
        isActive: queue.isActive
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: "Failed to toggle queue" });
  }
}