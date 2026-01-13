import app from "./app.js";
import connectDB from "./config/database.js";
import { config } from "./config/index.js";

/**
 * Connects to the database once when the module loads.
 * Required for serverless environments like Vercel.
 */
let isDbConnected = false;

/**
 * Ensures database connection is established.
 * Uses connection pooling to handle serverless cold starts efficiently.
 */
const ensureDbConnection = async () => {
	if (!isDbConnected) {
		await connectDB();
		isDbConnected = true;
		console.log("LOG: Database connected successfully");
	}
};

/**
 * Starts the server by connecting to the database and listening on the specified port.
 * Handles any startup errors by logging and exiting the process.
 */
const startServer = async () => {
	try {
		await ensureDbConnection();

		app.listen(
			config.port,
			/**
			 * Server listen callback.
			 * Logs the server startup message.
			 */ () => {
				console.log(`LOG: Server running at http://localhost:${config.port}`);
			},
		);
	} catch (error) {
		console.error("ERROR: Failed to start server:", error);
		process.exit(1);
	}
};

// Only start the server in non-Vercel environments
if (!process.env.VERCEL) {
	startServer();
}

// Export the app for Vercel serverless functions
export default app;
