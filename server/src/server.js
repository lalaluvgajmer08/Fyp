import app from './app.js';
import env from './config/env.js';
import connectDB, { disconnectDB } from './config/db.js';
import logger from './utils/logger.js';

let server;

const start = async () => {
  try {
    await connectDB();

    server = app.listen(env.port, () => {
      logger.success(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
    });
  } catch (err) {
    logger.error(`Startup failed: ${err.message}`);
    process.exit(1);
  }
};

/** Closes the HTTP server and the DB connection before exiting. */
const shutdown = async (signal) => {
  logger.warn(`${signal} received, shutting down`);
  server?.close(async () => {
    await disconnectDB();
    process.exit(0);
  });
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled rejection: ${err?.message}`);
  server?.close(() => process.exit(1));
});

start();
