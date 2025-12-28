import express from "express";
import type { Application } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app: Application = express();

/* =========================
   CORS Configuration
========================= */

// Allow multiple origins via .env (comma-separated)
const allowedOrigins: string[] = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",")
  : ["http://localhost:3000"];

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD"],
    credentials: true,
  })
);

/* =========================
   Global Middlewares
========================= */

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

/* =========================
   Routes
========================= */

// Example:
// import userRouter from "./routes/user.routes";
// app.use("/api/v1/users", userRouter);

/* =========================
   Export App
========================= */

export { app };
