import { Router, Request, Response } from 'express';
import { authenticateToken, requireRole } from '../middleware/auth.middleware.js';
import { mockDb } from '../lib/mock-db.js';

const router = Router();

/**
 * GET /api/clients
 * List all clients (all authenticated users can view)
 */
router.get('/', authenticateToken, async (_req: Request, res: Response) => {
  try {
    await mockDb.initialize();
    res.json({
      success: true,
      data: mockDb.getAllClients(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch clients',
    });
  }
});

/**
 * GET /api/clients/:id
 * Get a specific client (admin only)
 */
router.get('/:id', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // In a real implementation, this would query the database
    res.json({
      success: true,
      data: null,
      id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch client',
    });
  }
});

/**
 * POST /api/clients
 * Create a new client (all authenticated users can create)
 */
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, contactEmail, contactPhone, address } = req.body;

    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Name is required',
      });
      return;
    }

    await mockDb.initialize();
    
    // Create new client in mock database
    const newClient = {
      id: `client-${Date.now()}`,
      name,
      contactEmail: contactEmail || `contact@${name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
      contactPhone: contactPhone || '',
      address: address || '',
      active: true,
    };
    
    mockDb.clients.push(newClient);

    res.status(201).json({
      success: true,
      data: newClient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to create client',
    });
  }
});


/**
 * PUT /api/clients/:id
 * Update a client (admin only)
 */
router.put('/:id', authenticateToken, requireRole(['administrator']), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, contactEmail, contactPhone, address, active } = req.body;

    // In a real implementation, this would update in the database
    res.json({
      success: true,
      data: {
        id,
        name,
        contactEmail,
        contactPhone,
        address,
        active,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to update client',
    });
  }
});

export default router;
