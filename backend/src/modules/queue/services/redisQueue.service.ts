import { getRedisClient, isRedisReady } from "../../../config/redis.js";
import { Token, TokenStatus } from "../token.model.js";

const tokensKey = (queueId: string) => `queue:${queueId}:tokens`;
const nowServingKey = (queueId: string) => `queue:${queueId}:nowServing`;

export interface RedisTokenEntry {
  id: string;
  seq: number;
}

const isAvailable = (): boolean => {
  return !!getRedisClient() && isRedisReady();
};

export const enqueueToken = async (
  queueId: string,
  tokenId: string,
  seq: number,
): Promise<boolean> => {
  if (!isAvailable()) return false;

  try {
    const redis = getRedisClient();
    if (!redis) return false;

    await redis.zadd(tokensKey(queueId), String(seq), tokenId);
    console.info(
      `[Redis] Enqueued token ${tokenId} for queue ${queueId} (seq=${seq})`,
    );
    return true;
  } catch (error) {
    console.warn(
      "[Redis] Failed to enqueue token, falling back to MongoDB:",
      error,
    );
    return false;
  }
};

export const popNextToken = async (
  queueId: string,
): Promise<RedisTokenEntry | null> => {
  if (!isAvailable()) return null;

  try {
    const redis = getRedisClient();
    if (!redis) return null;

    const result = await redis.zpopmin(tokensKey(queueId), 1);
    if (!result || result.length < 2) return null;

    const tokenId = result[0];
    const seq = Number(result[1]);

    console.info(`[Redis] Popped next token ${tokenId} for queue ${queueId}`);
    return { id: tokenId, seq };
  } catch (error) {
    console.warn(
      "[Redis] Failed to pop next token, falling back to MongoDB:",
      error,
    );
    return null;
  }
};

export const setNowServing = async (
  queueId: string,
  tokenId: string | null,
): Promise<boolean> => {
  if (!isAvailable()) return false;

  try {
    const redis = getRedisClient();
    if (!redis) return false;

    if (!tokenId) {
      await redis.del(nowServingKey(queueId));
      console.info(`[Redis] Cleared now serving for queue ${queueId}`);
      return true;
    }

    await redis.set(nowServingKey(queueId), tokenId);
    console.info(`[Redis] Set now serving for queue ${queueId} -> ${tokenId}`);
    return true;
  } catch (error) {
    console.warn(
      "[Redis] Failed to set now serving, falling back to MongoDB:",
      error,
    );
    return false;
  }
};

export const getNowServing = async (
  queueId: string,
): Promise<string | null> => {
  if (!isAvailable()) return null;

  try {
    const redis = getRedisClient();
    if (!redis) return null;

    return await redis.get(nowServingKey(queueId));
  } catch (error) {
    console.warn(
      "[Redis] Failed to get now serving, falling back to MongoDB:",
      error,
    );
    return null;
  }
};

export const getWaitingTokens = async (
  queueId: string,
): Promise<RedisTokenEntry[] | null> => {
  if (!isAvailable()) return null;

  try {
    const redis = getRedisClient();
    if (!redis) return null;

    const entries = await redis.zrange(tokensKey(queueId), 0, -1, "WITHSCORES");
    const result: RedisTokenEntry[] = [];

    for (let i = 0; i < entries.length; i += 2) {
      result.push({ id: entries[i], seq: Number(entries[i + 1]) });
    }

    return result;
  } catch (error) {
    console.warn(
      "[Redis] Failed to read queue tokens, falling back to MongoDB:",
      error,
    );
    return null;
  }
};

export const removeToken = async (
  queueId: string,
  tokenId: string,
): Promise<boolean> => {
  if (!isAvailable()) return false;

  try {
    const redis = getRedisClient();
    if (!redis) return false;

    await redis.zrem(tokensKey(queueId), tokenId);
    const current = await redis.get(nowServingKey(queueId));
    if (current === tokenId) {
      await redis.del(nowServingKey(queueId));
    }
    console.info(`[Redis] Removed token ${tokenId} for queue ${queueId}`);
    return true;
  } catch (error) {
    console.warn(
      "[Redis] Failed to remove token, falling back to MongoDB:",
      error,
    );
    return false;
  }
};

export const rebuildRedisStateFromMongo = async (): Promise<void> => {
  if (!isAvailable()) return;

  try {
    const redis = getRedisClient();
    if (!redis) return;

    const tokenKeys = await redis.keys("queue:*:tokens");
    const nowServingKeys = await redis.keys("queue:*:nowServing");

    if (tokenKeys.length || nowServingKeys.length) {
      await redis.del([...tokenKeys, ...nowServingKeys]);
    }

    const waitingTokens = await Token.find({ status: TokenStatus.WAITING })
      .sort({ queue: 1, seq: 1 })
      .lean();

    const pipeline = redis.pipeline();

    waitingTokens.forEach((token) => {
      pipeline.zadd(
        tokensKey(token.queue.toString()),
        String(token.seq),
        token._id.toString(),
      );
    });

    const servedTokens = await Token.find({ status: TokenStatus.SERVED })
      .sort({ updatedAt: -1 })
      .lean();

    const servedMap = new Map<string, string>();

    servedTokens.forEach((token) => {
      const queueId = token.queue.toString();
      if (!servedMap.has(queueId)) {
        servedMap.set(queueId, token._id.toString());
      }
    });

    servedMap.forEach((tokenId, queueId) => {
      pipeline.set(nowServingKey(queueId), tokenId);
    });

    await pipeline.exec();
    console.info("✅ Redis active queue state rebuilt from MongoDB");
  } catch (error) {
    console.warn(
      "[Redis] Failed to rebuild state, continuing with MongoDB:",
      error,
    );
  }
};
