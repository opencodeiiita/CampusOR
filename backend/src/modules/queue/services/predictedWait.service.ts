import { Queue } from "../queue.model.js";
import { Token, TokenStatus } from "../token.model.js";
import { getPredictedWaitTime } from "./mlWaitTime.service.js";

export async function computeQueueFeatures(queueId: string) {
  // Get tokens ahead (waiting)
  const tokensAhead = await Token.countDocuments({
    queue: queueId,
    status: TokenStatus.WAITING,
  });

  // Get active counters (for now, assume 1 per queue)
  // TODO: If multiple counters per queue, update logic
  const activeCounters = 1;

  // Time features
  const now = new Date();
  const hoursOfDay = now.getHours();
  const dayOfWeek = now.getDay();

  // Calculate avg service time (last 10 completed tokens)
  const lastCompleted = await Token.find({
    queue: queueId,
    status: TokenStatus.COMPLETED,
  })
    .sort({ updatedAt: -1 })
    .limit(10);

  let avgServiceTime = 5; // fallback default
  if (lastCompleted.length > 1) {
    const times = lastCompleted.map(
      (t) => (t.updatedAt.getTime() - t.createdAt.getTime()) / 60000,
    );
    avgServiceTime = times.reduce((a, b) => a + b, 0) / times.length;
  }

  return {
    tokensAhead,
    activeCounters,
    hoursOfDay,
    dayOfWeek,
    avgServiceTime,
  };
}

export async function getQueuePredictedWait(queueId: string) {
  const features = await computeQueueFeatures(queueId);
  const predictedWaitMinutes = await getPredictedWaitTime(features);
  return predictedWaitMinutes;
}
