import env from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import logger from '../utils/logger.js';

/** Converts any thrown error into the standard JSON error envelope. */
const errorHandler = (err, _req, res, _next) => {
  let error = err;

  // Malformed ObjectId in a route param
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
  }

  // Mongoose schema validation
  if (err.name === 'ValidationError') {
    error = ApiError.badRequest(
      'Validation failed',
      Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }))
    );
  }

  // Unique index violation
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    error = ApiError.conflict(`Duplicate value for '${field}'`);
  }

  const statusCode = error.statusCode || 500;
  const message = error.isOperational ? error.message : 'Internal server error';

  if (statusCode >= 500) logger.error(`${err.message}\n${err.stack}`);

  res.status(statusCode).json({
    success: false,
    message,
    errors: error.errors?.length ? error.errors : undefined,
    stack: env.isDev ? err.stack : undefined,
  });
};

export default errorHandler;
