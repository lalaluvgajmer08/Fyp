import express from 'express';
import {
  getAllProducts,
  getFeaturedProducts,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { protect, authorize, attachUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public — attachUser reads the token if present, but never blocks
router.get('/', attachUser, getAllProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:slug', attachUser, getProductBySlug);

// Staff may add and edit stock; only an admin may remove it
router.post('/', protect, authorize('admin', 'staff'), createProduct);
router.put('/:id', protect, authorize('admin', 'staff'), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);

export default router;
