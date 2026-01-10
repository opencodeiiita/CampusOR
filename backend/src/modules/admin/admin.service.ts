import { Token, TokenStatus, Queue } from "../queue/queue.model.js";

/**
 * Admin Analytics Service
 * Provides data aggregation logic for admin dashboard analytics
 */

interface DashboardSummary {
  activeTokens: number;
  servedToday: number;
  skippedTokens: number;
  totalTokensToday: number;
  peakHour: string;
}

interface QueueLoad {
  time: string;
  activeTokens: number;
}

interface TokensServed {
  hour: string;
  served: number;
}

interface AvgWaitTime {
  queue: string;
  avgWaitMinutes: number;
}

interface TokenStatusCount {
  status: string;
  count: number;
}

/**
 * Get today's start and end timestamps
 */
const getTodayRange = () => {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  return { startOfDay, endOfDay };
};

/**
 * Dashboard Summary - Overview metrics
 */
export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const { startOfDay, endOfDay } = getTodayRange();

  // Count active tokens (waiting status)
  const activeTokens = await Token.countDocuments({
    status: TokenStatus.WAITING,
  });

  // Tokens served today
  const servedToday = await Token.countDocuments({
    status: TokenStatus.SERVED,
    updatedAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // Skipped tokens today
  const skippedTokens = await Token.countDocuments({
    status: TokenStatus.SKIPPED,
    updatedAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // Total tokens created today
  const totalTokensToday = await Token.countDocuments({
    createdAt: { $gte: startOfDay, $lte: endOfDay },
  });

  // Calculate peak hour based on token creation
  const peakHour = await calculatePeakHour(startOfDay, endOfDay);

  return {
    activeTokens,
    servedToday,
    skippedTokens,
    totalTokensToday,
    peakHour,
  };
};

/**
 * Calculate peak hour based on token creation count
 */
const calculatePeakHour = async (
  startOfDay: Date,
  endOfDay: Date
): Promise<string> => {
  const hourCounts = await Token.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $project: {
        hour: { $hour: "$createdAt" },
      },
    },
    {
      $group: {
        _id: "$hour",
        count: { $sum: 1 },
      },
    },
    {
      $sort: { count: -1 },
    },
    {
      $limit: 1,
    },
  ]);

  if (hourCounts.length === 0) {
    return "N/A";
  }

  const peakHourValue = hourCounts[0]._id;
  const nextHour = (peakHourValue + 1) % 24;

  return `${String(peakHourValue).padStart(2, "0")}:00 – ${String(
    nextHour
  ).padStart(2, "0")}:00`;
};

/**
 * Queue Load Over Time - Active tokens per hour today
 */
export const getQueueLoadOverTime = async (): Promise<QueueLoad[]> => {
  const { startOfDay, endOfDay } = getTodayRange();

  // Get hourly distribution of active tokens
  const hourlyData = await Token.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $project: {
        hour: { $hour: "$createdAt" },
        status: 1,
      },
    },
    {
      $group: {
        _id: "$hour",
        activeTokens: {
          $sum: {
            $cond: [{ $eq: ["$status", TokenStatus.WAITING] }, 1, 0],
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Format as time strings
  return hourlyData.map((item) => ({
    time: `${String(item._id).padStart(2, "0")}:00`,
    activeTokens: item.activeTokens,
  }));
};

/**
 * Tokens Served Per Hour - Count of served tokens by hour
 */
export const getTokensServedPerHour = async (): Promise<TokensServed[]> => {
  const { startOfDay, endOfDay } = getTodayRange();

  const hourlyServed = await Token.aggregate([
    {
      $match: {
        status: TokenStatus.SERVED,
        updatedAt: { $gte: startOfDay, $lte: endOfDay },
      },
    },
    {
      $project: {
        hour: { $hour: "$updatedAt" },
      },
    },
    {
      $group: {
        _id: "$hour",
        served: { $sum: 1 },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  // Format as hour ranges
  return hourlyServed.map((item) => {
    const startHour = String(item._id).padStart(2, "0");
    const endHour = String((item._id + 1) % 24).padStart(2, "0");
    return {
      hour: `${startHour} - ${endHour}`,
      served: item.served,
    };
  });
};

/**
 * Average Wait Time Per Queue
 * Calculates the difference between token creation and service time
 */
export const getAvgWaitTimePerQueue = async (): Promise<AvgWaitTime[]> => {
  const waitTimes = await Token.aggregate([
    {
      $match: {
        status: TokenStatus.SERVED,
      },
    },
    {
      $project: {
        queue: 1,
        waitMinutes: {
          $divide: [
            { $subtract: ["$updatedAt", "$createdAt"] },
            1000 * 60, // Convert ms to minutes
          ],
        },
      },
    },
    {
      $group: {
        _id: "$queue",
        avgWaitMinutes: { $avg: "$waitMinutes" },
      },
    },
    {
      $lookup: {
        from: "queues",
        localField: "_id",
        foreignField: "_id",
        as: "queueInfo",
      },
    },
    {
      $unwind: "$queueInfo",
    },
    {
      $project: {
        queue: "$queueInfo.name",
        avgWaitMinutes: { $round: ["$avgWaitMinutes", 0] },
      },
    },
    {
      $sort: { avgWaitMinutes: -1 },
    },
  ]);

  return waitTimes.map((item) => ({
    queue: item.queue,
    avgWaitMinutes: item.avgWaitMinutes,
  }));
};

/**
 * Token Status Distribution - Count of tokens by status
 */
export const getTokenStatusDistribution =
  async (): Promise<TokenStatusCount[]> => {
    const statusCounts = await Token.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          status: {
            $switch: {
              branches: [
                { case: { $eq: ["$_id", "waiting"] }, then: "Waiting" },
                { case: { $eq: ["$_id", "served"] }, then: "Served" },
                { case: { $eq: ["$_id", "skipped"] }, then: "Skipped" },
                { case: { $eq: ["$_id", "cancelled"] }, then: "Cancelled" },
              ],
              default: "$_id",
            },
          },
          count: 1,
        },
      },
    ]);

    // Ensure all statuses are present, even with 0 count
    const allStatuses = ["Waiting", "Served", "Skipped", "Cancelled"];
    const result: TokenStatusCount[] = allStatuses.map((status) => {
      const found = statusCounts.find((item) => item.status === status);
      return {
        status,
        count: found ? found.count : 0,
      };
    });

    return result;
  };
