import { Router } from 'express';
import { createAnswerGroup, getAnswerGroups } from '../controllers/answerGroupController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticateToken, getAnswerGroups);
router.post('/', authenticateToken, authorizeRole('admin'), createAnswerGroup);

export default router;
