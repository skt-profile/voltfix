/**
 * Lightweight error class carrying an HTTP status code.
 * Thrown from controllers/services and caught by the global error handler.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
