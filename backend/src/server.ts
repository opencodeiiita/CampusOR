import http from "http";
import app from "./app.js";
import dbConnect from "./config/db.js";
import { env } from "./config/env.js";
import { initializeSocket } from "./server/socket.js";
import { initializeRedis } from "./config/redis.js";
import { rebuildRedisStateFromMongo } from "./modules/queue/services/redisQueue.service.js";
import { startTokenExpiryJob } from "./cron/tokenExpiry.job.js";

const startServer = async () => {
  try {
    await dbConnect();
    initializeRedis();
    await rebuildRedisStateFromMongo();
    startTokenExpiryJob(); // ✅ Start Cron Job
    const httpServer = http.createServer(app);
    initializeSocket(httpServer);

    httpServer.listen(env.PORT, () => {
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
