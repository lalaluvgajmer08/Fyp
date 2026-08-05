import express from 'express';
import authRoutes from './auth.routes.js';
import newsRoutes from './news.routes.js';
import rateRoutes from './rate.routes.js';
import productRoutes from './product.routes.js';

const router = express.Router();

router.get('/health', (_req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

router.use('/auth', authRoutes);
router.use('/news', newsRoutes);
router.use('/rates', rateRoutes);
router.use('/products', productRoutes);

// Future modules mount here: /users, /customers,
// /inventory, /orders, /exchanges, /invoices

export default router;
