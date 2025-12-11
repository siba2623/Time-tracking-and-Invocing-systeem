import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { mockDb } from '../lib/mock-db.js';

const router = Router();

/**
 * GET /api/users
 * List all users (admin only)
 */
router.get('/', authenticateToken, requireRole(['administrator']), async (_req: Request, res: Response) => {
  try {
    await mockDb.initialize();
    const users = mockDb.getAllUsers().map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
    }));
    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users',
    });
  }
});

/**
 * GET /api/users/employees
 * List all employees (for dropdowns)
 */
router.get('/employees', authenticateToken, async (_req: Request, res: Response) => {
  try {
    await mockDb.initialize();
    const employees = mockDb.getAllUsers()
      .filter(u => u.role === 'employee')
      .map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
      }));
    res.json({
      success: true,
      data: employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employees',
    });
  }
});

export default router;
