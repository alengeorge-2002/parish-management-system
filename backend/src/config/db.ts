import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/devagiri_parish_db';

let cachedDb: typeof mongoose | null = null;

/**
 * Centralized MongoDB Connection Module using Mongoose.
 * Implements global connection pooling and caching to support Serverless / Lambda reuse.
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  // If connection already exists and readyState is 1 (connected), return cached connection
  if (cachedDb && mongoose.connection.readyState === 1) {
    return cachedDb;
  }

  if (mongoose.connection.readyState === 1) {
    cachedDb = mongoose;
    return cachedDb;
  }

  console.log(`Establishing MongoDB connection to ${MONGODB_URI}...`);
  try {
    cachedDb = await mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
    console.log(`MongoDB Connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
    return cachedDb;
  } catch (err: any) {
    console.error('MongoDB Connection Error:', err.message || err);
    cachedDb = null;
    throw err;
  }
};

export default connectDB;
