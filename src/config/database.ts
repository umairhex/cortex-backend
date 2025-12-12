import mongoose from "mongoose";
import { config } from "./index.js";

/**
 * Connects to the MongoDB database using Mongoose.
 * Uses the MONGODB_URI environment variable or defaults to local MongoDB.
 * Exits the process on connection failure.
 */
const connectDB = async (): Promise<void> => {
  try {
    await mongoose.connect(config.mongoURI);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

export default connectDB;
