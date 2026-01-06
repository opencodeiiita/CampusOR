import { Router, Response, NextFunction } from "express";
import {
  createQueue,
  generateToken,
  updateTokenStatus,
  getOperatorView,
  toggleQueue,
} from "./queue.controller.js";
import { verifyJWT, AuthRequest } from "../../middlewares/auth.js";

const router = Router();

// Middleware to check if the user has the required role
const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    // Cast user to any to access custom properties like role
    const user = req.user as any;

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({
        success: false,
        error: "Forbidden: Insufficient permissions"
      });
    }
    next();
  };
};

// Queue Management Routes (Protected)
router.post(
  "/",
  verifyJWT,
  authorize(["admin", "operator"]),
  createQueue
);

router.patch(
  "/:queueId",
  verifyJWT,
  authorize(["admin", "operator"]),
  toggleQueue
);

router.get(
  "/:queueId/operator-view",
  verifyJWT,
  authorize(["admin", "operator"]),
  getOperatorView
);

// Token Operations (Public & Protected)

// User joins queue (Public)
router.post("/:queueId/tokens", generateToken);

// Operator updates token status (Protected)
router.patch(
  "/tokens/:tokenId/status",
  verifyJWT,
  authorize(["admin", "operator"]),
  updateTokenStatus
);

export default router;