import dotenv from 'dotenv';

// Load variables from server/.env into process.env
dotenv.config();

/**
 * Reads an environment variable.
 * Throws immediately if a required variable is missing, so the app
 * fails at startup instead of halfway through a request.
 */
const required = (key) => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

const env = {
  port: Number(process.env.PORT) || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',

  mongoUri: required('MONGO_URI'),

  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  jwtSecret: required('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};

env.isDev = env.nodeEnv === 'development';
env.isProd = env.nodeEnv === 'production';

export default env;
