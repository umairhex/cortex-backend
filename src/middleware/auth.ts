import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/index.js";
import User from "../models/User.js";

/**
 * Extended Request interface to include user.
 */
declare global {
	namespace Express {
		interface Request {
			// biome-ignore lint/suspicious/noExplicitAny: Express user property is dynamically assigned
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
	next: NextFunction,
) => {
	/* DEBUG LOGGING START */

	console.log(`[AuthMiddleware] Request to ${req.method} ${req.path}`);
	console.log(
		`[AuthMiddleware] Headers present: ${!!req.headers.authorization}`,
	);
	console.log(
		`[AuthMiddleware] Cookies present: ${req.cookies ? Object.keys(req.cookies).join(",") : "None"}`,
	);
	/* DEBUG LOGGING END */

	const authHeader = req.headers.authorization;
	const token = authHeader?.split(" ")[1] || req.cookies?.accessToken;

	if (!token) {
		console.log("[AuthMiddleware] ❌ No token found in Headers or Cookies");
		return res.status(401).json({ message: "Access token required" });
	}

	jwt.verify(
		token,
		config.jwtSecret,
		/**
		 * JWT verification callback.
		 * Handles token verification result.
		 */
		// biome-ignore lint/suspicious/noExplicitAny: Decoded is loose
		async (err: Error | null, decoded: any) => {
			if (err) {
				console.log(`[AuthMiddleware] ❌ Token verify failed: ${err.message}`);
				return res.status(401).json({ message: "Invalid token" });
			}
			console.log(
				`[AuthMiddleware] ✅ Token verified for UserID: ${decoded.userId}`,
			);

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
		},
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
