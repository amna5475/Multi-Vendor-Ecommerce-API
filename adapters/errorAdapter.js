/**
 * Custom Error Adapters for formatting exceptions
 */

const createError = (message, statusCode, name, errors = null) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  error.name = name;
  // Capture stack trace, excluding this factory function from the trace
  Error.captureStackTrace(error, createError);
  return error;
};

const BadRequestError = (message = 'Bad Request', errors = null) => 
  createError(message, 400, 'BadRequestError', errors);

const UnauthorizedError = (message = 'Unauthorized') => 
  createError(message, 401, 'UnauthorizedError');

const ForbiddenError = (message = 'Forbidden') => 
  createError(message, 403, 'ForbiddenError');

const NotFoundError = (message = 'Resource not found') => 
  createError(message, 404, 'NotFoundError');

const TooManyRequestsError = (message = 'Too many requests') =>
  createError(message, 429, 'TooManyRequestsError');

const InternalServerError = (message = 'Internal Server Error') => 
  createError(message, 500, 'InternalServerError');

module.exports = {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  NotFoundError,
  TooManyRequestsError,
  InternalServerError
};
