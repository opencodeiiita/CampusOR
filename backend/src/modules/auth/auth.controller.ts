import { Request, Response } from "express";
import {
  registerUser,
  loginUser,
  createAdminUser,
  verifyEmailOtp,
  resendEmailOtp,
  acceptAdminInvite,
  AuthError,
} from "./auth.service.js";
import { AuthRequest } from "../../middlewares/auth.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, collegeEmail, department, position } = req.body;
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "name, email and password are required",
      });
    }

    // Reject admin role registration
    if (role === "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin role registration is not allowed",
      });
    }

    // Validate role if provided
    const validRoles = ["user", "operator"];
    const finalRole = role || "user";
    if (!validRoles.includes(finalRole)) {
      return res.status(400).json({
        success: false,
        message: `Invalid role. Must be one of: ${validRoles.join(", ")}`,
      });
    }

    const user = await registerUser({ 
      name, 
      email, 
      password, 
      role: finalRole,
      collegeEmail,
      department,
      position,
    });

    return res.status(201).json({
      success: true,
      message: "OTP sent to your email",
      email: user.email,
    });
  } catch (error: any) {
    const status = error instanceof AuthError ? error.status : 400;
    return res.status(status).json({
      success: false,
      message: error.message || "Registration failed !",
      code: error instanceof AuthError ? error.code : undefined,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "email and password are required",
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      success: true,
      message: "Login successful",
      ...result, // { token, user }
    });
  } catch (error: any) {
    const status = error instanceof AuthError ? error.status : 400;
    const response: Record<string, any> = {
      success: false,
      message: error.message || "Login failed",
      code: error instanceof AuthError ? error.code : undefined,
    };

    if (error instanceof AuthError && error.code === "EMAIL_NOT_VERIFIED") {
      response.requiresVerification = true;
    }

    return res.status(status).json(response);
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "email and otp are required",
      });
    }

    const result = await verifyEmailOtp({ email, otp });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      ...result, // { token, user }
    });
  } catch (error: any) {
    const status = error instanceof AuthError ? error.status : 400;
    return res.status(status).json({
      success: false,
      message: error.message || "Email verification failed",
      code: error instanceof AuthError ? error.code : undefined,
    });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "email is required",
      });
    }

    const result = await resendEmailOtp({ email });

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    const status = error instanceof AuthError ? error.status : 400;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to resend OTP",
      code: error instanceof AuthError ? error.code : undefined,
    });
  }
};

export const createAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password } = req.body;
    const createdByAdminId = req.user?.sub;

    if (!createdByAdminId) {
      return res.status(400).json({
        message: "Only admins can create another admin",
      });
    }

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required",
      });
    }

    // Create admin user (only accessible by existing admin users via middleware)
    const user = await createAdminUser({ name, email, password, createdByAdminId });

    return res.status(201).json({
      message: "Admin user created successfully",
      user,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Admin creation failed",
    });
  }
};

export const acceptInvite = async (req: Request, res: Response) => {
  try {
    const { token, email, name, password } = req.body;

    if (!token || !email || !name || !password) {
      return res.status(400).json({
        success: false,
        message: "token, email, name and password are required",
      });
    }

    const result = await acceptAdminInvite({ email, token, name, password });

    return res.status(200).json({
      success: true,
      message: "Admin account setup successful",
      ...result,
    });
  } catch (error: any) {
    const status = error instanceof AuthError ? error.status : 400;
    return res.status(status).json({
      success: false,
      message: error.message || "Failed to accept invite",
      code: error instanceof AuthError ? error.code : undefined,
    });
  }
};
