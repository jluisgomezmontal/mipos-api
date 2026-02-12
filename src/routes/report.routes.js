import express from 'express';
import reportController from '../controllers/report.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { injectTenantContext } from '../middlewares/tenantContext.js';
import { salesReportSchema, topProductsSchema } from '../validators/report.validator.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(injectTenantContext);

router.get(
  '/sales',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(salesReportSchema),
  reportController.getSalesReport
);

router.get(
  '/top-products',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(topProductsSchema),
  reportController.getTopProducts
);

router.get(
  '/revenue-by-branch',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(salesReportSchema),
  reportController.getRevenueByBranch
);

router.get(
  '/payment-methods',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(salesReportSchema),
  reportController.getPaymentMethodsReport
);

router.get('/dashboard', reportController.getDashboardStats);

router.get(
  '/sales-by-user',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(salesReportSchema),
  reportController.getSalesByUser
);

export default router;
