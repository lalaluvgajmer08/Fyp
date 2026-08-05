/**
 * Error type for expected, client-facing failures
 * (validation problems, not-found, unauthorised, etc.).
 *
 * `isOperational: true` marks it as a known condition, letting the
 * error handler distinguish it from an unexpected programming bug.
 *
 *   throw new ApiError(404, 'Product not found');
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad request', errors = []) {
    return new ApiError(400, msg, errors);
  }

  static unauthorized(msg = 'Unauthorized') {
    return new ApiError(401, msg);
  }

  static forbidden(msg = 'Forbidden') {
    return new ApiError(403, msg);
  }

  static notFound(msg = 'Resource not found') {
    return new ApiError(404, msg);
  }

  static conflict(msg = 'Resource already exists') {
    return new ApiError(409, msg);
  }
}

export default ApiError;
