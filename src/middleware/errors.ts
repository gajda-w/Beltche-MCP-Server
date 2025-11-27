import type { Request, Response, NextFunction } from 'express';
import { logger } from './logger.js';
import { isDev } from '../config/env.js';

/**
 * Base application error class
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    code: string,
    message: string,
    isOperational = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authorization error - user needs to authenticate
 */
export class AuthorizationError extends AppError {
  constructor(message = 'Authorization required') {
    super(401, 'UNAUTHORIZED', message);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(resource = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, 'VALIDATION_ERROR', message);
  }
}

/**
 * External API error
 */
export class ExternalApiError extends AppError {
  constructor(
    public readonly service: string,
    public readonly originalStatus: number,
    message: string
  ) {
    super(502, 'EXTERNAL_API_ERROR', message);
  }
}

/**
 * Rate limit error
 */
export class RateLimitError extends AppError {
  constructor() {
    super(429, 'RATE_LIMITED', 'Too many requests, please try again later');
  }
}

/**
 * Global error handler middleware
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Log error
  if (err instanceof AppError && err.isOperational) {
    logger.warn({ err, path: req.path }, 'Operational error');
  } else {
    logger.error({ err, path: req.path }, 'Unexpected error');
  }

  // Determine response
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: err.code,
      message: err.message,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // Unknown error - don't leak details in production
  res.status(500).json({
    error: 'INTERNAL_ERROR',
    message: isDev ? err.message : 'An unexpected error occurred',
    ...(isDev && { stack: err.stack }),
  });
}

/**
 * Async handler wrapper - catches promise rejections
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
