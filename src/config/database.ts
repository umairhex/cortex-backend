import mongoose from "mongoose";
import { config } from "./index.js";

/**
 * Tracks the database connection state for serverless environments.
 */
let isConnected = false;

/**
 * Connects to the MongoDB database using Mongoose.
 * Handles connection caching for serverless environments like Vercel.
 * Uses the MONGODB_URI environment variable or defaults to local MongoDB.
 */
const connectDB = async (): Promise<void> => {
	// If already connected, skip reconnection
	if (isConnected && mongoose.connection.readyState === 1) {
		console.log("LOG: Using existing MongoDB connection");
		return;
	}

	try {
		// Set mongoose options for serverless
		mongoose.set("bufferCommands", false);

		const conn = await mongoose.connect(config.mongoURI, {
			maxPoolSize: 10,
			serverSelectionTimeoutMS: 5000,
			socketTimeoutMS: 45000,
		});

		const firstConnection = conn.connections[0];
		isConnected = firstConnection ? firstConnection.readyState === 1 : false;
		console.log("LOG: MongoDB connected successfully");
	} catch (error) {
		console.error("ERROR: MongoDB connection error:", error);
		// Don't exit in serverless - let the request fail gracefully
		if (!process.env.VERCEL) {
			process.exit(1);
		}
		throw error;
	}
};

export default connectDB;
