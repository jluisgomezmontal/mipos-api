import express from 'express';
import inventoryController from '../controllers/inventory.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { injectTenantContext } from '../middlewares/tenantContext.js';
import {
  createInventoryMovementSchema,
  updateInventorySchema,
  queryInventorySchema,
} from '../validators/inventory.validator.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(injectTenantContext);

router.get('/', validate(queryInventorySchema), inventoryController.getInventory);

router.get('/:productId/:branchId', inventoryController.getInventoryByProductAndBranch);

router.post(
  '/movements',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(createInventoryMovementSchema),
  inventoryController.createInventoryMovement
);

router.get('/movements', inventoryController.getInventoryMovements);

router.patch(
  '/:id',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(updateInventorySchema),
  inventoryController.updateInventory
);

router.patch(
  '/:productId/:branchId',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(updateInventorySchema),
  inventoryController.updateInventorySettings
);

export default router;
