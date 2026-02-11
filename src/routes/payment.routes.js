import express from 'express';
import paymentController from '../controllers/payment.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { injectTenantContext } from '../middlewares/tenantContext.js';
import { createPaymentSchema, queryPaymentSchema } from '../validators/payment.validator.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(injectTenantContext);

router.post('/', validate(createPaymentSchema), paymentController.createPayment);

router.get('/', validate(queryPaymentSchema), paymentController.getPayments);

router.get('/sale/:saleId', paymentController.getPaymentsBySale);

router.get('/:id', paymentController.getPaymentById);

router.post(
  '/:id/refund',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  paymentController.refundPayment
);

export default router;
