import { Router } from "express";
import { verifyJWT, authorize } from "../../middlewares/auth.js";
import { getDashboard } from "./admin.controller.js";

const router = Router();

// Example protected admin endpoint
router.get("/dashboard", verifyJWT, authorize("admin"), getDashboard);

export default router;
