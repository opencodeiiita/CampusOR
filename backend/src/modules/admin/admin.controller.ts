import { Response } from "express";
import { AuthRequest } from "../../middlewares/auth.js";


 // Example admin endpoint - Dashboard
 //Protected by verifyJWT + authorize("admin") middleware

export const getDashboard = (req: AuthRequest, res: Response) => {
  return res.status(200).json({
    message: "Welcome to admin dashboard",
    user: {
      id: req.user?.sub,
      role: req.user?.role,
    },
  });
};
