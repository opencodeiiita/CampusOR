import express from "express";
import cors from "cors";
import healthRouter from "./routes/health.js";
import router from "./routes/index.js";
import queueRouter from "./modules/queue/queue.routes.js";
import operatorRouter from "./modules/operator/operator.routes.js";
import { env } from "./config/env.js";

const app = express();

// Enable CORS for frontend
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
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


// Main routes
app.use("/", router);

export default app;
