import express from 'express';
import {
  getTodayRates,
  getRateHistory,
  upsertRate,
  updateRate,
  deleteRate,
} from '../controllers/rate.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

// Public — the storefront rate board reads these
router.get('/today', getTodayRates);
router.get('/history', getRateHistory);

// Staff may publish the daily rate; only admin may delete history
router.post('/', protect, authorize('admin', 'staff'), upsertRate);
router.put('/:id', protect, authorize('admin', 'staff'), updateRate);
router.delete('/:id', protect, authorize('admin'), deleteRate);

export default router;
