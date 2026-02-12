import { Router } from 'express';
import {
  createModel,
  getModels,
  getModelById,
  updateModel,
  deleteModel,
} from '../controllers/modelController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, getModels);
router.get('/:id', authenticateToken, getModelById);

router.post('/', authenticateToken, authorizeRole('admin'), createModel);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateModel);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteModel);

export default router;
