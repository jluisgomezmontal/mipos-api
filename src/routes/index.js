import express from 'express';
import authRoutes from './auth.routes.js';
import productRoutes from './product.routes.js';
import branchRoutes from './branch.routes.js';
import inventoryRoutes from './inventory.routes.js';
import saleRoutes from './sale.routes.js';
import paymentRoutes from './payment.routes.js';
import reportRoutes from './report.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/branches', branchRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/sales', saleRoutes);
router.use('/payments', paymentRoutes);
router.use('/reports', reportRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'MiPOS API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
