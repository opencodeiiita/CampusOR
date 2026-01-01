import express from "express";
import healthRouter from "./routes/health.js";
import router from "./routes/index.js";
import queueRouter from "./modules/queue/queue.routes.js";
import operatorRouter from "./modules/operator/operator.routes.js";
import adminRouter from "./modules/admin/admin.routes.js";

const app = express();

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

// Main routes
app.use("/", router);

export default app;
