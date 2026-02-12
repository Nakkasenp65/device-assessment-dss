import { Router } from 'express';
import {
  createCondition,
  getConditions,
  getConditionById,
  updateCondition,
  deleteCondition,
  getConditionCategories,
} from '../controllers/conditionController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, getConditions);
router.get('/categories', authenticateToken, getConditionCategories);
router.get('/:id', authenticateToken, getConditionById);

router.post('/', authenticateToken, authorizeRole('admin'), createCondition);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateCondition);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteCondition);

export default router;
