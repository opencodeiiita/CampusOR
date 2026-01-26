import { apiService } from "../api";
import { Queue } from "../../components/queue/queue.types";

export const queueService = {
  async getQueues(): Promise<Queue[]> {
    try {
      const response = await apiService.get("/queues", false);
      // For each queue, fetch predicted wait time
      const queues: Queue[] = response.queues || [];
      const withPredictions = await Promise.all(
        queues.map(async (queue) => {
          try {
            const pred = await apiService.get(
              `/queues/${queue.queueId}/predicted-wait`,
              false,
            );
            return {
              ...queue,
              waitTime:
                pred &&
                pred.predictedWaitMinutes !== null &&
                pred.predictedWaitMinutes !== undefined
                  ? pred.predictedWaitMinutes
                  : null,
            };
          } catch (e) {
            return { ...queue, waitTime: null };
          }
        }),
      );
      return withPredictions;
    } catch (error) {
      console.error("Failed to fetch queues:", error);
      throw error;
    }
  },
};
