/**
 * Authentication Routes
 * Validates: Requirements 10.1, 10.2
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { login, getUserById } from '../services/auth.service.js';
import { ApiError } from '../types/errors.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

/**
 * POST /api/auth/login
 * Validates: Requirements 10.1, 10.2
 */
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = loginSchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const { email, password } = validation.data;
    const result = await login(email, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (_req: Request, res: Response) => {
  // JWT is stateless, so logout is handled client-side by removing the token
  res.json({ message: 'Logged out successfully' });
});

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await getUserById(req.user!.userId);
    res.json(user);
  } catch (error) {
    next(error);
  }
});

export { router as authRoutes };
