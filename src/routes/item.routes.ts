import { Router } from 'express';
import * as itemController from '../controllers/item.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Get all items
router.get('/', authenticate, itemController.getItems);

// Get available items
router.get('/available', authenticate, itemController.getAvailableItems);

// Search items
router.get('/search', authenticate, itemController.searchItems);

// Create item (admin only)
router.post('/', authenticate, isAdmin, itemController.createItem);

// Update item (admin only)
router.put('/:id', authenticate, isAdmin, itemController.updateItem);

// Update item status (admin only)
router.put('/:id/status', authenticate, isAdmin, itemController.updateItemStatus);

// Get item QR code
router.get('/:id/qrcode', authenticate, itemController.getItemQRCode);

// Get item by ID
router.get('/:id', authenticate, itemController.getItemById);

// Create bulk items (admin only)
router.post('/bulk', authenticate, isAdmin, itemController.createBulkItems);

export default router; 