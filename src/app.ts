import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
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
 * CORS middleware to enable cross-origin resource sharing.
 */
app.use(
	cors({
		origin: [
			"http://localhost:5173",
			"http://127.0.0.1:5173",
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:8000",
			"http://localhost:4321",
			/https:\/\/.*\.vercel\.app$/,
			/https:\/\/.*\.netlify\.app$/,
		],
		credentials: true,
	}),
);

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
