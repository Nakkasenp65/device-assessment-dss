import { Router } from 'express';
import {
  createAssessment,
  getAssessmentById,
  getUserAssessments,
  getAdminDashboardStats,
  getAllAssessments,
  getAllFeedback,
} from '../controllers/assessmentController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

// Admin stats
router.get('/admin/stats', authenticateToken, authorizeRole('admin'), getAdminDashboardStats);
router.get('/admin/all', authenticateToken, authorizeRole('admin'), getAllAssessments);
router.get('/admin/feedback', authenticateToken, authorizeRole('admin'), getAllFeedback);

// Protect all routes
router.get('/my-assessments', authenticateToken, getUserAssessments);
router.post('/', authenticateToken, createAssessment);
router.get('/:id', authenticateToken, getAssessmentById);

export default router;
