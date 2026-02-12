import { Router } from 'express';
import {
  createBrand,
  getBrands,
  getBrandById,
  updateBrand,
  deleteBrand,
} from '../controllers/brandController.js';
import { authenticateToken, authorizeRole } from '../middleware/authMiddleware.js';

const router = Router();

// Public read access? Or Admin only? User said "Admin will manage these data".
// Usually read is public, write is admin. But let's verify context.
// "Admin side responsibility is to check the feedback and the manage the data..."
// I'll protect ALL management routes with admin.
// Maybe GET can be public or authenticated user.
// For now, I'll protect WRITE with admin. GET can be authenticated.
// Actually, strict requirement: "Admin will mange these data... CRUD".
// I'll make everything protected, but maybe GET allows 'user' too?
// For implementation simplicity and safety according to "backend for admin side", I'll put admin guard on all mutations.

// GET /brands - Public or Authenticated? Let's make it Authenticated for now.
router.get('/', authenticateToken, getBrands);
router.get('/:id', authenticateToken, getBrandById);

// POST, PUT, DELETE - Admin only
router.post('/', authenticateToken, authorizeRole('admin'), createBrand);
router.put('/:id', authenticateToken, authorizeRole('admin'), updateBrand);
router.delete('/:id', authenticateToken, authorizeRole('admin'), deleteBrand);

export default router;
