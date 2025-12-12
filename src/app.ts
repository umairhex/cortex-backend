import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

/**
 * Main Express application instance.
 * Configures middleware, routes, and error handling.
 */
const app: express.Application = express();

/**
 * Security middleware to set various HTTP headers for security.
 */
app.use(helmet());

/**
 * CORS middleware to enable cross-origin resource sharing.
 */
app.use(cors());

/**
 * JSON parsing middleware with a 10MB limit.
 */
app.use(express.json({ limit: "10mb" }));

/**
 * URL-encoded parsing middleware with a 10MB limit.
 */
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

/**
 * Root route handler.
 * Responds with a simple greeting message.
 */
app.get("/", (req, res) => {
  res.send("Hello World!");
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
