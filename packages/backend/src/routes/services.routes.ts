import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { mockDb } from '../lib/mock-db.js';

const router = Router();

/**
 * GET /api/services
 * List all services
 */
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    await mockDb.initialize();
    res.json({
      success: true,
      data: mockDb.getAllServices(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch services',
    });
  }
});

/**
 * POST /api/services
 * Create a new service (admin only)
 */
router.post('/', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Service name is required',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        name,
        description: description ?? '',
        active: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create service',
    });
  }
});

/**
 * PUT /api/services/:id
 * Update a service (admin only)
 */
router.put('/:id', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, description, active } = req.body;

    res.json({
      success: true,
      data: {
        id,
        name,
        description,
        active,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update service',
    });
  }
});

export default router;
