import { Router } from "express";
import { generateQueue } from "./generateQueue.controller.js";
import { verifyJWT, authorize } from "../../middlewares/auth.js";

const router = Router();

router.post(
  "/",
  verifyJWT,
  authorize("operator", "admin"), // Operators and admins
  generateQueue
);

export default router;
