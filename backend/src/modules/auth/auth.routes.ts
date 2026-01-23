import { Router } from "express";
import { register, login, createAdmin, verifyEmail, resendOtp, acceptInvite } from "./auth.controller.js";
import { verifyJWT, authorize } from "../../middlewares/auth.js";

const router = Router();

router.post("/register", register);
router.post("/signup", register);
router.post("/login", login);
router.post("/signin", login);
router.post("/verify-email", verifyEmail);
router.post("/resend-otp", resendOtp);
router.post("/admin/create", verifyJWT, authorize("admin"), createAdmin);
router.post("/admin/accept-invite", acceptInvite);

export default router;
