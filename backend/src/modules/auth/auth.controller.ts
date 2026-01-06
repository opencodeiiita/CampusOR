import { Request, Response } from "express";
import { registerUser, loginUser, createAdminUser } from "./auth.service.js";
import { AuthRequest } from "../../middlewares/auth.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role, collegeEmail, department, position } = req.body;
    console.log(name, email, password, role); //debugg
    
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required",
      });
    }

    // Reject admin role registration
    if (role === "admin") {
      return res.status(403).json({
        message: "Admin role registration is not allowed",
      });
    }

    // Validate role if provided
    const validRoles = ["user", "operator"];
    const finalRole = role || "user";
    if (!validRoles.includes(finalRole)) {
      return res.status(400).json({
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
      message: "User registered successfully !",
      user,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Registration failed !",
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "email and password are required",
      });
    }

    const result = await loginUser({ email, password });

    return res.status(200).json({
      message: "Login successful",
      ...result, // { token, user }
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Login failed",
    });
  }
};

export const createAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, collegeEmail } = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required",
      });
    }

    // Create admin user (only accessible by existing admin users via middleware)
    const user = await createAdminUser({ name, email, password, collegeEmail });

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
