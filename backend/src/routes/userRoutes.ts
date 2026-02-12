import { Router } from 'express';
import {
  getUsers,
  getUserById,
  updateUserRole,
  deleteUser,
} from '../controllers/userController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

// All user management routes are admin-only
router.get('/', authenticateToken, authorizeRole('admin'), getUsers);
router.get('/:id', authenticateToken, authorizeRole('admin'), getUserById);
router.patch('/:id/role', authenticateToken, authorizeRole('admin'), updateUserRole);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteUser);

export default router;
