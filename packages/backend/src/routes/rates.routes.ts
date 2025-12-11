import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { mockDb } from '../lib/mock-db.js';

const router = Router();

/**
 * GET /api/rates
 * List all rates (admin only)
 */
router.get('/', authenticateToken, requireRole(['administrator']), async (_req: Request, res: Response) => {
  try {
    await mockDb.initialize();
    res.json({
      success: true,
      data: mockDb.rates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rates',
    });
  }
});

/**
 * GET /api/rates/service/:serviceId
 * Get rates for a specific service (admin only)
 */
router.get('/service/:serviceId', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { serviceId } = req.params;
    res.json({
      success: true,
      data: [],
      serviceId,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch rates for service',
    });
  }
});

/**
 * POST /api/rates
 * Create a new rate (admin only)
 */
router.post('/', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { serviceId, employeeId, hourlyRate } = req.body;

    if (!serviceId || hourlyRate === undefined) {
      res.status(400).json({
        success: false,
        error: 'Service ID and hourly rate are required',
      });
      return;
    }

    if (typeof hourlyRate !== 'number' || hourlyRate <= 0) {
      res.status(400).json({
        success: false,
        error: 'Hourly rate must be a positive number',
      });
      return;
    }

    res.status(201).json({
      success: true,
      data: {
        serviceId,
        employeeId: employeeId ?? null,
        hourlyRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create rate',
    });
  }
});

/**
 * PUT /api/rates/:id
 * Update a rate (admin only)
 */
router.put('/:id', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { hourlyRate } = req.body;

    if (hourlyRate !== undefined && (typeof hourlyRate !== 'number' || hourlyRate <= 0)) {
      res.status(400).json({
        success: false,
        error: 'Hourly rate must be a positive number',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id,
        hourlyRate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update rate',
    });
  }
});

export default router;
