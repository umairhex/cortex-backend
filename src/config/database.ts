import mongoose from 'mongoose';

/**
 * Connects to the MongoDB database using Mongoose.
 * Uses the MONGODB_URI environment variable or defaults to local MongoDB.
 * Exits the process on connection failure.
 */
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/cortex-backend';
    await mongoose.connect(mongoURI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

export default connectDB;