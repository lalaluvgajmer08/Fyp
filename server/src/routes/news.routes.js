import express from 'express';
import {
  getAllNews,
  getLatestNews,
  getNewsBySlug,
  createNews,
  updateNews,
  deleteNews,
} from '../controllers/news.controller.js';
import { protect, authorize, attachUser } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public — attachUser reads the token if present, but never blocks
router.get('/', attachUser, getAllNews);
router.get('/latest', getLatestNews);
router.get('/:slug', attachUser, getNewsBySlug);

// Admin only
router.post('/', protect, authorize('admin'), createNews);
router.put('/:id', protect, authorize('admin'), updateNews);
router.delete('/:id', protect, authorize('admin'), deleteNews);

export default router;
