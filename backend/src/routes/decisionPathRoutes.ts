import { Router } from 'express';
import {
  getPaths,
  getPathById,
  createPath,
  updatePath,
  deletePath,
} from '../controllers/decisionPathController.js';
import { calculateAhp } from '../controllers/ahpController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

// AHP Calculation (Admin only)
router.post('/ahp/calculate', authenticateToken, authorizeRole('admin'), calculateAhp);

// Decision Path CRUD (Admin only)
router.get('/', authenticateToken, getPaths);
router.get('/:id', authenticateToken, getPathById);
router.post('/', authenticateToken, authorizeRole('admin'), createPath);
router.put('/:id', authenticateToken, authorizeRole('admin'), updatePath);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deletePath);

export default router;
