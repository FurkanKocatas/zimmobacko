import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, isAdmin, userController.getUsers);
router.post('/', authenticate, isAdmin, userController.createUser);
router.put('/:id/role', authenticate, isAdmin, userController.updateUserRole);

export default router; 