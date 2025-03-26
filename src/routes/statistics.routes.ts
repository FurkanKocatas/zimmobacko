import { Router } from 'express';
import * as statisticsController from '../controllers/statistics.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, isAdmin, statisticsController.getSystemStats);

export default router; 