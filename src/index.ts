import app from "./app.js";
import connectDB from "./config/database.js";
import { config } from "./config/index.js";

/**
 * Starts the server by connecting to the database and listening on the specified port.
 * Handles any startup errors by logging and exiting the process.
 */
const startServer = async () => {
	try {
		await connectDB();

		app.listen(
			config.port,
			/**
			 * Server listen callback.
			 * Logs the server startup message.
			 */ () => {
				console.log(`Server running at http://localhost:${config.port}`);
			},
		);
	} catch (error) {
		console.error("Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
