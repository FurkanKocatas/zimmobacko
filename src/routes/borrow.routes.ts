import { Router } from 'express';
import * as borrowController from '../controllers/borrow.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Create borrow request (any authenticated user)
router.post('/', authenticate, borrowController.createBorrowRequest);

// Get all borrow requests (admin only)
router.get('/', authenticate, isAdmin, borrowController.getBorrowRequests);

// Approve borrow request (admin only)
router.put('/:id/approve', authenticate, isAdmin, borrowController.approveBorrowRequest);

// Return item (any authenticated user)
router.put('/:id/return', authenticate, borrowController.returnItem);

export default router; 