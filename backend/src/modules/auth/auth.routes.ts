import { Router } from "express";
import { register, login, createAdmin } from "./auth.controller.js";
import { verifyJWT, authorize } from "../../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.post("/admin/create", verifyJWT, authorize("admin"), createAdmin);

export default router;
