import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import connectDB from "./config/database.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import routes from "./routes/index.js";

/**
 * Main Express application instance.
 * Configures middleware, routes, and error handling.
 */
const app: express.Application = express();

/**
 * Security middleware to set various HTTP headers for security.
 */
app.use(
	helmet({
		crossOriginResourcePolicy: { policy: "cross-origin" },
	}),
);

/**
 * Allowed origins for CORS.
 */
const allowedOrigins = [
	process.env.FRONTEND_URL,
].filter(Boolean);

/**
 * CORS middleware to enable cross-origin resource sharing.
 */
app.use(
	cors({
		origin: (origin, callback) => {
			// Allow requests with no origin (mobile apps, curl, etc.)
			if (!origin) return callback(null, true);

			// Check if origin matches allowed patterns
			if (
				allowedOrigins.includes(origin) ||
				/https:\/\/.*\.vercel\.app$/.test(origin) ||
				/https:\/\/.*\.netlify\.app$/.test(origin)
			) {
				return callback(null, true);
			}

			callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	}),
);

/**
 * Database connection middleware for serverless environments.
 * Ensures database is connected before processing requests.
 */
app.use(async (_req, res, next) => {
	try {
		await connectDB();
		next();
	} catch (error) {
		console.error("ERROR: Database connection failed in middleware:", error);
		res.status(500).json({ message: "Database connection failed" });
	}
});

/**
 * Cookie parser middleware.
 */
app.use(cookieParser());

/**
 * JSON parsing middleware with a 10MB limit.
 */
app.use(express.json({ limit: "10mb" }));

/**
 * URL-encoded parsing middleware with a 10MB limit.
 */
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

/**
 * Health
 */
app.get("/healthz", (_req, res) => {
	res.send("Server is running!");
});

/**
 * API routes middleware, mounting all API endpoints under /api.
 */
app.use("/api", routes);

/**
 * 404 not found handler for unmatched routes.
 */
app.use(notFoundHandler);

/**
 * Global error handler middleware.
 */
app.use(errorHandler);

export default app;
