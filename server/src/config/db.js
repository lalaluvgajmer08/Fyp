import mongoose from 'mongoose';
import env from './env.js';
import logger from '../utils/logger.js';

/**
 * Opens the MongoDB connection.
 * Called once from server.js before the HTTP server starts listening,
 * so the API never accepts traffic without a working database.
 */
const connectDB = async () => {
  // Reject queries on fields that are not in the schema instead of ignoring them
  mongoose.set('strictQuery', true);

  const conn = await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
  });

  logger.success(`MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);

  // Connection-level events (fired after the initial connect succeeds)
  mongoose.connection.on('error', (err) => {
    logger.error(`MongoDB error: ${err.message}`);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  return conn;
};

/** Closes the connection cleanly during shutdown. */
export const disconnectDB = async () => {
  await mongoose.connection.close();
  logger.info('MongoDB connection closed');
};

export default connectDB;
