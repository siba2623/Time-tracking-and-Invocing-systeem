/**
 * Authentication and Authorization Middleware
 * Validates: Requirements 10.3, 10.4
 */
import { Request, Response, NextFunction } from 'express';
import { verifyToken, AuthPayload } from '../services/auth.service.js';
import { ApiError } from '../types/errors.js';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Middleware to verify JWT token and attach user to request
 * Validates: Requirements 10.3, 10.4
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No token provided');
    }

    const token = authHeader.substring(7);
    const payload = verifyToken(token);
    req.user = payload;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Middleware to check if user has administrator role
 * Validates: Requirements 10.3, 10.4
 */
export function adminMiddleware(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (req.user.role !== 'administrator') {
    return next(ApiError.forbidden('Administrator access required'));
  }

  next();
}

/**
 * Middleware to check if user has specific role(s)
 * Validates: Requirements 10.3, 10.4
 */
export function roleMiddleware(...allowedRoles: ('employee' | 'administrator')[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
    }

    next();
  };
}

// Aliases for route compatibility
export const authenticateToken = authMiddleware;
export function requireRole(allowedRoles: ('employee' | 'administrator')[]) {
  return roleMiddleware(...allowedRoles);
}
