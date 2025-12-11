import { Request, Response, NextFunction } from 'express';
import { ApiError, ErrorCode } from '../types/errors.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err);

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      code: err.code,
      message: err.message,
      details: err.details,
      timestamp: new Date().toISOString(),
      requestId: _req.headers['x-request-id'] || 'unknown',
    });
  }

  return res.status(500).json({
    code: ErrorCode.INTERNAL_ERROR,
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString(),
    requestId: _req.headers['x-request-id'] || 'unknown',
  });
}
