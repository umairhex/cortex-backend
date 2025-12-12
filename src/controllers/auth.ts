import type { Request, Response } from "express";
import { body, validationResult } from "express-validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import User from "../models/User.js";
import { config } from "../config/index.js";

/**
 * Generates access and refresh tokens.
 */
const generateTokens = (userId: string) => {
  // @ts-ignore
  const accessToken = jwt.sign({ userId }, config.jwtSecret, {
    expiresIn: config.jwtExpiry,
  });
  // @ts-ignore
  const refreshToken = jwt.sign({ userId }, config.refreshTokenSecret, {
    expiresIn: config.refreshTokenExpiry,
  });
  return { accessToken, refreshToken };
};

/**
 * Validation rules for signup.
 */
export const signupValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 6 }),
];

/**
 * Signup handler.
 * Creates a new user account and returns tokens.
 */
export const signup = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = new User({ email, password });
    await user.save();

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    res.status(201).json({
      message: "User created successfully",
      accessToken,
      refreshToken,
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Validation rules for signin.
 */
export const signinValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").exists(),
];

/**
 * Signin handler.
 * Authenticates user and returns tokens.
 */
export const signin = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = generateTokens(user._id.toString());
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 12);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    res.json({ message: "Signin successful", accessToken, refreshToken });
  } catch (error) {
    console.error("Signin error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Refresh token handler.
 * Generates new access token using valid refresh token.
 */
export const refresh = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(401).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const isValidRefreshToken = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );
    if (!isValidRefreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(
      user._id.toString()
    );
    const hashedRefreshToken = await bcrypt.hash(newRefreshToken, 12);
    user.refreshToken = hashedRefreshToken;
    await user.save();

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

/**
 * Logout handler.
 * Invalidates the refresh token.
 */
export const logout = async (req: Request, res: Response) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ message: "Refresh token required" });
  }

  try {
    const decoded = jwt.verify(refreshToken, config.refreshTokenSecret) as {
      userId: string;
    };
    const user = await User.findById(decoded.userId);

    if (user) {
      user.refreshToken = undefined;
      await user.save();
    }

    res.json({ message: "Logout successful" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Validation rules for forgot password.
 */
export const forgotPasswordValidation = [
  body("email").isEmail().normalizeEmail(),
];

/**
 * Forgot password handler.
 * Sends a password reset email.
 */
export const forgotPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({
        message:
          "If an account with that email exists, a reset link has been sent.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000);

    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    const transporter = nodemailer.createTransport(config.email);
    const mailOptions = {
      from: config.email.auth.user,
      to: email,
      subject: "Password Reset",
      text: `You requested a password reset. Click the link to reset: http://localhost:${config.port}/reset-password?token=${resetToken}`,
    };

    await transporter.sendMail(mailOptions);

    res.json({
      message:
        "If an account with that email exists, a reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Validation rules for reset password.
 */
export const resetPasswordValidation = [
  body("token").exists(),
  body("password").isLength({ min: 6 }),
];

/**
 * Reset password handler.
 * Resets the user's password using the reset token.
 */
export const resetPassword = async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { token, password } = req.body;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: new Date() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }

    user.password = password;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    res.json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
