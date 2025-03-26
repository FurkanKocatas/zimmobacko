import { Router } from 'express';
import * as exportController from '../controllers/export.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/items', authenticate, isAdmin, exportController.exportItems);
router.get('/borrow-history', authenticate, isAdmin, exportController.exportBorrowHistory);

export default router; 