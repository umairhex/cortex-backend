import app from './app.js';
import { config } from './config/index.js';
import connectDB from './config/database.js';

/**
 * Starts the server by connecting to the database and listening on the specified port.
 * Handles any startup errors by logging and exiting the process.
 */
const startServer = async () => {
  try {
    // Connect to the MongoDB database
    await connectDB();
    // Start the Express server
    app.listen(config.port, () => {
      console.log(`Server running at http://localhost:${config.port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Initiate server startup
startServer(); 