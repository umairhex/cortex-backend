import express from "express";
import { getHealth } from "./health.js";
import {
  signup,
  signin,
  signupValidation,
  signinValidation,
  refresh,
  logout,
  forgotPassword,
  resetPassword,
  forgotPasswordValidation,
  resetPasswordValidation,
} from "../controllers/auth.js";
import { authenticateToken } from "../middleware/auth.js";
import { authRateLimit } from "../middleware/rateLimit.js";
import User from "../models/User.js";

/**
 * Express router for API routes.
 * Defines all application routes.
 */
const router: express.Router = express.Router();

/**
 * Health check route.
 */
router.get("/health", getHealth);

/**
 * User signup route with rate limiting and validation.
 */
router.post("/signup", authRateLimit, signupValidation, signup);

/**
 * User signin route with rate limiting and validation.
 */
router.post("/signin", authRateLimit, signinValidation, signin);

/**
 * Token refresh route.
 */
router.post("/refresh", refresh);

/**
 * User logout route.
 */
router.post("/logout", logout);

/**
 * Forgot password route with rate limiting and validation.
 */
router.post(
  "/forgot-password",
  authRateLimit,
  forgotPasswordValidation,
  forgotPassword
);

/**
 * Reset password route with validation.
 */
router.post("/reset-password", resetPasswordValidation, resetPassword);

/**
 * Get user profile route, requires authentication.
 */
router.get(
  "/profile",
  authenticateToken,
  /**
   * Get user profile handler.
   * Retrieves the authenticated user's profile data.
   */ async (req, res) => {
    try {
      const user = await User.findById(req.user.userId).select(
        "-password -refreshToken"
      );
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user });
    } catch (error) {
      console.error("Profile fetch error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
