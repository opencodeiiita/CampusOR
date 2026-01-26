import { Response } from "express";
import { Queue } from "./queue.model.js";
import { Token, TokenStatus } from "./token.model.js";
import { TokenService } from "./services/token.service.js";
import { AuthRequest } from "../../middlewares/auth.js";
import { ensureQueueAccess } from "../operator/operator.utils.js";
import { broadcastQueueUpdate } from "../../server/socket.js";

import { getQueuePredictedWait } from "./services/predictedWait.service.js";

// 1: Create a new queue
// 6: Get predicted wait time for a queue (ML-powered)
export async function getPredictedWaitTime(req: AuthRequest, res: Response) {
  try {
    const { queueId } = req.params;
    const predictedWaitMinutes = await getQueuePredictedWait(queueId);
    if (predictedWaitMinutes === null || predictedWaitMinutes === undefined) {
      return res.status(200).json({
        queueId,
        predictedWaitMinutes: null,
        success: false,
        error: "Prediction unavailable",
      });
    }
    return res.status(200).json({
      queueId,
      predictedWaitMinutes: Math.round(predictedWaitMinutes),
      success: true,
    });
  } catch (error) {
    console.error("Predicted Wait Error:", error);
    return res.status(500).json({
      queueId: req.params.queueId,
      predictedWaitMinutes: null,
      success: false,
      error: "Failed to get predicted wait time",
    });
  }
}
export async function createQueue(req: AuthRequest, res: Response) {
  try {
    const { name, location, operator } = req.body;

    // Use the explicit operator from body, or default to the creating user
    // (This allows admins to assign operators, or operators to assign themselves)
    const operatorId = operator || req.user?.sub;

    if (!name || !location) {
      return res.status(400).json({
        success: false,
        error: "Queue name and location are required",
      });
    }

    // Check for duplicate queue (same name + location)
    const existingQueue = await Queue.findOne({ name, location });
    if (existingQueue) {
      return res.status(409).json({
        success: false,
        error: "A queue with this name and location already exists",
      });
    }

    const queue = await Queue.create({
      name,
      location,
      operator: operatorId || null,
      isActive: true,
      nextSequence: 1,
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
  } catch (error) {
    console.error("Create Queue Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to create queue",
    });
  }
}

// 2: Generate token for a user in a queue
export async function generateToken(req: AuthRequest, res: Response) {
  const { queueId } = req.params;
  const userId = req.user?.sub; // Get userId from auth if available
  console.log(
    `[Token] Request to generate token for queue: ${queueId}${userId ? ` for user: ${userId}` : ""}`,
  );

  // We rely on the service to handle the logic, but we could add
  // checks here if the queue is active before calling service
  const result = await TokenService.generateToken(queueId, userId);
  console.log(`[Token] Result:`, result);

  if (!result.success) {
    // Return 429 for rate limiting, 409 for conflict, 400 for other errors
    let status = 400;
    if (result.retryAfterSeconds) {
      status = 429;
    } else if (result.error && result.error.includes("already")) {
      status = 409;
    }
    return res.status(status).json(result);
  }

  await broadcastQueueUpdate(queueId);
  return res.status(201).json(result);
}

// 3: Update token status
export async function updateTokenStatus(req: AuthRequest, res: Response) {
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

  if (result.token?.queueId) {
    await broadcastQueueUpdate(result.token.queueId);
  }
  return res.status(200).json(result);
}

// 4: Get Queue State for Operator Dashboard
export async function getQueueOperatorView(req: AuthRequest, res: Response) {
  try {
    const { queueId } = req.params;

    const { queue, error } = await ensureQueueAccess(queueId, req.user);
    if (error) {
      return res
        .status(error.status)
        .json({ success: false, error: error.message });
    }
    if (!queue) {
      return res.status(404).json({ success: false, error: "Queue not found" });
    }

    // Fetch waiting tokens sorted by sequence
    const waitingTokens = await Token.find({
      queue: queueId,
      status: TokenStatus.WAITING,
    })
      .sort({ seq: 1 })
      .select("id seq status");

    // Fetch the token currently being served (most recently updated to SERVED)
    const nowServingToken = await Token.findOne({
      queue: queueId,
      status: TokenStatus.SERVED,
    })
      .sort({ updatedAt: -1 })
      .select("id seq status");

    return res.status(200).json({
      queue: {
        id: queue._id,
        name: queue.name,
        location: queue.location,
        status: queue.isActive ? "ACTIVE" : "PAUSED",
      },
      tokens: waitingTokens.map((t) => ({
        id: t._id,
        number: t.seq,
        status: t.status,
      })),
      nowServing: nowServingToken
        ? { id: nowServingToken._id, number: nowServingToken.seq }
        : null,
    });
  } catch (error) {
    console.error("Get Operator View Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch queue state",
    });
  }
}

// 5: Get all queues for public listing
export async function getQueuesForUsers(req: AuthRequest, res: Response) {
  try {
    const queues = await Queue.find({}).select(
      "name location isActive createdAt",
    );

    // Get queue stats for each queue
    const queuesWithStats = await Promise.all(
      queues.map(async (queue) => {
        // Count waiting tokens for this queue
        const waitingCount = await Token.countDocuments({
          queue: queue._id,
          status: TokenStatus.WAITING,
        });

        // Calculate estimated wait time (5 minutes per waiting person)
        const estimatedWaitTime = waitingCount * 5;

        // Determine status based on isActive flag
        let status: "open" | "paused" | "closed";
        if (!queue.isActive) {
          status = "paused";
        } else if (waitingCount >= 20) {
          status = "closed";
        } else {
          status = "open";
        }

        return {
          // queueId: `Q-${queue._id.toString().slice(-4)}`,
          queueId: queue._id.toString(),
          queueName: queue.name,
          location: queue.location,
          counterNumber: 1, // Default value, can be enhanced later
          queueLength: waitingCount,
          waitTime: estimatedWaitTime,
          status,
        };
      }),
    );

    return res.status(200).json({
      success: true,
      queues: queuesWithStats,
    });
  } catch (error) {
    console.error("Get Queues Error:", error);
    return res.status(500).json({
      success: false,
      error: "Failed to fetch queues",
    });
  }
}
