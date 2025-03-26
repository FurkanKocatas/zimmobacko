import { Router } from 'express';
import * as reportController from '../controllers/report.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// All report endpoints require admin access
router.get('/weekly', authenticate, isAdmin, reportController.getWeeklyReport);
router.get('/currently-borrowed', authenticate, isAdmin, reportController.getCurrentlyBorrowedItems);
router.get('/late-returns', authenticate, isAdmin, reportController.getLateReturns);

export default router; 