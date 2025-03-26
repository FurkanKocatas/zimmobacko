import { Router } from 'express';
import * as dashboardController from '../controllers/dashboard.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, isAdmin, dashboardController.getDashboardSummary);

export default router; 