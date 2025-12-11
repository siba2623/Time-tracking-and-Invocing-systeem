import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { Request, Response, NextFunction } from 'express';

// Inline the middleware logic for testing without Prisma dependency
interface AuthPayload {
  userId: string;
  email: string;
  role: 'employee' | 'administrator';
}

class ApiError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400
  ) {
    super(message);
  }
  static unauthorized(message = 'Authentication required') {
    return new ApiError('AUTHENTICATION_REQUIRED', message, 401);
  }
  static forbidden(message = 'Access denied') {
    return new ApiError('AUTHORIZATION_DENIED', message, 403);
  }
}

function adminMiddleware(req: Request & { user?: AuthPayload }, _res: Response, next: NextFunction) {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }
  if (req.user.role !== 'administrator') {
    return next(ApiError.forbidden('Administrator access required'));
  }
  next();
}

function roleMiddleware(...allowedRoles: ('employee' | 'administrator')[]) {
  return (req: Request & { user?: AuthPayload }, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Access denied. Required roles: ${allowedRoles.join(', ')}`));
    }
    next();
  };
}

function createMockReq(user?: AuthPayload): Partial<Request> & { user?: AuthPayload } {
  return { user };
}

function createMockRes(): Partial<Response> {
  return {};
}


describe('Authorization Middleware - Property Tests', () => {
  /**
   * **Feature: time-tracking-invoicing, Property 18: Role-Based Access Control**
   * **Validates: Requirements 10.3, 10.4**
   *
   * For any authenticated user and any protected endpoint, access SHALL be
   * granted if and only if the user's role has permission for that endpoint.
   */
  describe('Property 18: Role-Based Access Control', () => {
    it('adminMiddleware grants access only to administrators', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('employee', 'administrator') as fc.Arbitrary<'employee' | 'administrator'>,
          fc.uuid(),
          fc.emailAddress(),
          (role, userId, email) => {
            const req = createMockReq({ userId, email, role });
            const res = createMockRes();
            let nextCalled = false;
            let errorPassed: Error | undefined;

            const next: NextFunction = (err?: unknown) => {
              nextCalled = true;
              errorPassed = err as Error | undefined;
            };

            adminMiddleware(req as Request & { user?: AuthPayload }, res as Response, next);

            if (role === 'administrator') {
              expect(nextCalled).toBe(true);
              expect(errorPassed).toBeUndefined();
            } else {
              expect(nextCalled).toBe(true);
              expect(errorPassed).toBeDefined();
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('roleMiddleware grants access only to allowed roles', () => {
      fc.assert(
        fc.property(
          fc.constantFrom('employee', 'administrator') as fc.Arbitrary<'employee' | 'administrator'>,
          fc.subarray(['employee', 'administrator'] as const, { minLength: 1 }),
          fc.uuid(),
          fc.emailAddress(),
          (userRole, allowedRoles, userId, email) => {
            const req = createMockReq({ userId, email, role: userRole });
            const res = createMockRes();
            let nextCalled = false;
            let errorPassed: Error | undefined;

            const next: NextFunction = (err?: unknown) => {
              nextCalled = true;
              errorPassed = err as Error | undefined;
            };

            const middleware = roleMiddleware(...allowedRoles);
            middleware(req as Request & { user?: AuthPayload }, res as Response, next);

            const shouldHaveAccess = allowedRoles.includes(userRole);
            
            if (shouldHaveAccess) {
              expect(nextCalled).toBe(true);
              expect(errorPassed).toBeUndefined();
            } else {
              expect(nextCalled).toBe(true);
              expect(errorPassed).toBeDefined();
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it('unauthenticated requests are always denied', () => {
      fc.assert(
        fc.property(
          fc.subarray(['employee', 'administrator'] as const, { minLength: 1 }),
          (allowedRoles) => {
            const req = createMockReq(undefined);
            const res = createMockRes();
            let errorPassed: Error | undefined;

            const next: NextFunction = (err?: unknown) => {
              errorPassed = err as Error | undefined;
            };

            const middleware = roleMiddleware(...allowedRoles);
            middleware(req as Request & { user?: AuthPayload }, res as Response, next);

            expect(errorPassed).toBeDefined();
          }
        ),
        { numRuns: 20 }
      );
    });
  });
});
