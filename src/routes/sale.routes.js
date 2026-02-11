import express from 'express';
import saleController from '../controllers/sale.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { injectTenantContext } from '../middlewares/tenantContext.js';
import {
  createSaleSchema,
  updateSaleStatusSchema,
  querySaleSchema,
} from '../validators/sale.validator.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(injectTenantContext);

router.post('/', validate(createSaleSchema), saleController.createSale);

router.get('/', validate(querySaleSchema), saleController.getSales);

router.get('/today', saleController.getSalesToday);

router.get('/:id', saleController.getSaleById);

router.patch(
  '/:id/cancel',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(updateSaleStatusSchema),
  saleController.cancelSale
);

export default router;
