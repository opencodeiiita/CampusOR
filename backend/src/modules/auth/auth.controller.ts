import { Request, Response } from "express";
import { registerUser, loginUser } from "./auth.service.js";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    console.log(name, email, password, role); //debugg
    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({
        message: "name, email and password are required",
      });
    }

    const user = await registerUser({ name, email, password, role });

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
