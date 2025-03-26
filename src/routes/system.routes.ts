import { Router } from 'express';
import * as systemController from '../controllers/system.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/health', authenticate, isAdmin, systemController.getSystemHealth);
router.post('/cleanup', authenticate, isAdmin, systemController.runCleanup);

export default router; 