import { Router } from 'express';
import authRoutes from './auth.routes';
import itemRoutes from './item.routes';
import categoryRoutes from './category.routes';
import borrowRoutes from './borrow.routes';
import reportRoutes from './report.routes';
import dashboardRoutes from './dashboard.routes';
import maintenanceRoutes from './maintenance.routes';
import userRoutes from './user.routes';
import { authenticate } from '../middleware/auth.middleware';
import statisticsRoutes from './statistics.routes';
import exportRoutes from './export.routes';
import systemRoutes from './system.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/items', itemRoutes);
router.use('/categories', categoryRoutes);
router.use('/borrow', borrowRoutes);
router.use('/reports', reportRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/users', userRoutes);
router.use('/statistics', statisticsRoutes);
router.use('/export', exportRoutes);
router.use('/system', systemRoutes);

// Remove or comment out the reports route for now
// router.use('/reports', authenticate, isAdmin, reportRoutes);

export default router; 