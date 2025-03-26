import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

// Only admins can create categories
router.post('/', authenticate, categoryController.createCategory);
router.get('/', authenticate, categoryController.getCategories);

export default router; 