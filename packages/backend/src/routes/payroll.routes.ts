import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * GET /api/payroll/breakdown
 * Get payroll breakdown by client/employee (admin only)
 */
router.get('/breakdown', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { employeeId, clientId, startDate, endDate } = req.query;

    // Validate required date range
    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'Start date and end date are required',
      });
      return;
    }

    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
      return;
    }

    // In a real implementation, this would query the database
    res.json({
      success: true,
      data: [],
      filters: {
        employeeId,
        clientId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch payroll breakdown',
    });
  }
});

/**
 * GET /api/payroll/commission
 * Get commission report (admin only)
 */
router.get('/commission', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { employeeId, startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      res.status(400).json({
        success: false,
        error: 'Start date and end date are required',
      });
      return;
    }

    const parsedStartDate = new Date(startDate as string);
    const parsedEndDate = new Date(endDate as string);

    if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
      res.status(400).json({
        success: false,
        error: 'Invalid date format',
      });
      return;
    }

    res.json({
      success: true,
      data: [],
      filters: {
        employeeId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch commission report',
    });
  }
});


/**
 * PUT /api/payroll/allocation/:employeeId
 * Update employee allocation percentage (admin only)
 */
router.put('/allocation/:employeeId', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { employeeId } = req.params;
    const { percentage } = req.body;

    if (percentage === undefined) {
      res.status(400).json({
        success: false,
        error: 'Percentage is required',
      });
      return;
    }

    if (typeof percentage !== 'number' || percentage < 0 || percentage > 100) {
      res.status(400).json({
        success: false,
        error: 'Percentage must be a number between 0 and 100',
      });
      return;
    }

    // In a real implementation, this would update the database
    res.json({
      success: true,
      data: {
        employeeId,
        percentage,
        updatedAt: new Date(),
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update allocation',
    });
  }
});

export default router;
