import express from 'express';
import productController from '../controllers/product.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { injectTenantContext } from '../middlewares/tenantContext.js';
import {
  createProductSchema,
  updateProductSchema,
  queryProductSchema,
} from '../validators/product.validator.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(injectTenantContext);

router.post(
  '/',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(createProductSchema),
  productController.createProduct
);

router.get('/', validate(queryProductSchema), productController.getProducts);

router.get('/sku/:sku', productController.getProductBySku);

router.get('/barcode/:barcode', productController.getProductByBarcode);

router.get('/:id', productController.getProductById);

router.patch(
  '/:id',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete('/:id', authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN), productController.deleteProduct);

export default router;
