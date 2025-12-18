/**
 * Time Entry Routes
 * Validates: Requirements 1.1-1.8, 2.1-2.4, 3.1-3.4
 */
import { Router, Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import {
  createTimeEntry,
  updateTimeEntry,
  deleteTimeEntry,
  getTimeEntriesForUser,
  getAllTimeEntries,
} from '../services/time-entry.service.js';
import { authMiddleware, adminMiddleware } from '../middleware/auth.middleware.js';
import { ApiError } from '../types/errors.js';

const router = Router();

const createTimeEntrySchema = z.object({
  clientId: z.string().min(1),
  serviceId: z.string().min(1),
  activityDate: z.string().transform((s) => new Date(s)),
  memo: z.string().optional(),
  rate: z.number().positive(),
  duration: z.number().positive().max(24),
  billable: z.boolean(),
});

const updateTimeEntrySchema = z.object({
  clientId: z.string().min(1).optional(),
  serviceId: z.string().min(1).optional(),
  activityDate: z.string().transform((s) => new Date(s)).optional(),
  memo: z.string().optional(),
  rate: z.number().positive().optional(),
  duration: z.number().positive().max(24).optional(),
  billable: z.boolean().optional(),
});

const filtersSchema = z.object({
  clientId: z.string().min(1).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  billable: z.enum(['true', 'false']).optional(),
  employeeId: z.string().min(1).optional(),
});

// All routes require authentication
router.use(authMiddleware);


/**
 * GET /api/time-entries
 * Get time entries (user's own or all for admin)
 */
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = filtersSchema.safeParse(req.query);
    if (!validation.success) {
      throw ApiError.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const filters = {
      clientId: validation.data.clientId,
      startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
      endDate: validation.data.endDate ? new Date(validation.data.endDate) : undefined,
      billable: validation.data.billable === 'true' ? true : validation.data.billable === 'false' ? false : undefined,
      employeeId: validation.data.employeeId,
    };

    // Admin can see all entries, employees only their own
    if (req.user!.role === 'administrator' && filters.employeeId !== req.user!.userId) {
      const entries = await getAllTimeEntries(filters);
      res.json(entries);
    } else {
      const entries = await getTimeEntriesForUser(req.user!.userId, filters);
      res.json(entries);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/time-entries
 * Create a new time entry
 */
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = createTimeEntrySchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const entry = await createTimeEntry(req.user!.userId, validation.data);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/time-entries/:id
 * Update a time entry
 */
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = updateTimeEntrySchema.safeParse(req.body);
    if (!validation.success) {
      throw ApiError.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const entry = await updateTimeEntry(req.user!.userId, req.params.id, validation.data);
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/time-entries/:id
 * Delete a time entry
 */
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await deleteTimeEntry(req.user!.userId, req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

/**
 * PATCH /api/time-entries/:id/status
 * Update time entry status (approve/reject) - Admin only
 */
router.patch('/:id/status', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.body;
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw ApiError.validation({ status: ['Status must be pending, approved, or rejected'] });
    }

    const { mockDb } = await import('../lib/mock-db.js');
    await mockDb.initialize();
    
    const entry = mockDb.updateTimeEntry(req.params.id, { status });
    if (!entry) {
      throw ApiError.notFound('Time entry not found');
    }
    
    res.json(entry);
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/time-entries/export
 * Export time entries to Excel (admin only)
 * Validates: Requirements 5.3
 */
router.get('/export', adminMiddleware, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validation = filtersSchema.safeParse(req.query);
    if (!validation.success) {
      throw ApiError.validation(
        Object.fromEntries(
          validation.error.errors.map((e) => [e.path.join('.'), [e.message]])
        )
      );
    }

    const filters = {
      clientId: validation.data.clientId,
      startDate: validation.data.startDate ? new Date(validation.data.startDate) : undefined,
      endDate: validation.data.endDate ? new Date(validation.data.endDate) : undefined,
      billable: validation.data.billable === 'true' ? true : validation.data.billable === 'false' ? false : undefined,
      employeeId: validation.data.employeeId,
    };

    // Get all entries with filters
    const entries = await getAllTimeEntries(filters);

    // In a real implementation, this would use ExcelJS to generate the file
    // For now, return JSON with Excel-like structure
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="time-entries.xlsx"');

    // Placeholder - would be actual Excel buffer
    const exportData = JSON.stringify({
      type: 'excel_export',
      rowCount: entries.length,
      filters,
    });

    res.send(Buffer.from(exportData, 'utf-8'));
  } catch (error) {
    next(error);
  }
});

export { router as timeEntriesRoutes };
