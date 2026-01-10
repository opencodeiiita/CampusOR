import express from "express";
import cors from "cors"; // [ADDED] Import cors
import healthRouter from "./routes/health.js";
import router from "./routes/index.js";
import queueRouter from "./modules/queue/queue.routes.js";
import operatorRouter from "./modules/operator/operator.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";
import notificationRouter from "./modules/notifications/email.route.js";
import generateQueueRouter from "./modules/generateQueue/generateQueue.route.js";
import fetchQueueDataRouter from "./modules/fetchQueueData/fetchQueueData.route.js";
import { env } from "./config/env.js";

const app = express();

// [ADDED] CORS Middleware
// This allows your frontend (port 3000) to talk to this backend
app.use(
  cors({
    origin: env.FRONTEND_URL, // Allow only your frontend
    credentials: true, // Allow cookies/tokens if needed
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// basic middleware
app.use(express.json());

// routes
app.use("/health", healthRouter);
// Queue API endpoints
app.use("/api/queues", queueRouter);
// Operator API endpoints
app.use("/api/operator", operatorRouter);
// Admin API endpoints (protected)
app.use("/api/admin", adminRouter);
// Notification API endpoints
app.use("/api/notifications", notificationRouter);
// Generate Queue API endpoints
app.use("/api/generate-queue", generateQueueRouter);
// Fetch Queue Data API endpoints
app.use("/api/queue-data", fetchQueueDataRouter);

// Main routes
app.use("/api", router);

export default app;
