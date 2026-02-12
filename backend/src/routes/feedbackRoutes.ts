import { Router } from 'express';
import { createFeedback } from '../controllers/feedbackController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Allow authenticated users to submit feedback
router.post('/', authenticateToken, createFeedback);

export default router;
