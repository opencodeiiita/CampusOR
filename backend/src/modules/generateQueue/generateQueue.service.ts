import { Queue } from "../queue/queue.model.js";

export const generateQueueService = async (
  name: string,
  operatorId: string
) => {
  return await Queue.create({
    name,
    operator: operatorId,
  });
};
