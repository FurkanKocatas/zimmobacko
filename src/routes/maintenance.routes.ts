import { Router } from 'express';
import * as maintenanceController from '../controllers/maintenance.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.post('/:id/start', authenticate, isAdmin, maintenanceController.startMaintenance);
router.post('/:id/complete', authenticate, isAdmin, maintenanceController.completeMaintenance);

export default router; 