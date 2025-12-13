import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import User from "../models/User.js";

/**
 * Extended Request interface to include user.
 */
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware to authenticate JWT tokens.
 * Verifies token and attaches user to request.
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Access token required" });
  }

  jwt.verify(
    token,
    config.jwtSecret,
    /**
     * JWT verification callback.
     * Handles token verification result.
     */ async (err, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      
      try {
        const user = await User.findById(decoded.userId);
        if (!user) {
             return res.status(404).json({ message: "User not found" });
        }
        req.user = user;
        next();
      } catch (error) {
         console.error("Auth middleware error:", error);
         return res.status(500).json({ message: "Internal server error" });
      }
    }
  );
};

/**
 * Middleware to authorize users based on roles.
 * @param roles - Array of allowed roles.
 */
export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
