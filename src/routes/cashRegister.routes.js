import express from 'express';
import cashRegisterController from '../controllers/cashRegister.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { injectTenantContext } from '../middlewares/tenantContext.js';
import { validate } from '../middlewares/validate.js';
import {
  openCashRegisterSchema,
  addWithdrawalSchema,
  closeCashRegisterSchema,
} from '../validators/cashRegister.validator.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(injectTenantContext);

router.post(
  '/open',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.CASHIER),
  validate(openCashRegisterSchema),
  cashRegisterController.openCashRegister
);

router.get(
  '/current',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.CASHIER),
  cashRegisterController.getCurrentOpenRegister
);

router.post(
  '/withdrawal',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.CASHIER),
  validate(addWithdrawalSchema),
  cashRegisterController.addWithdrawal
);

router.get(
  '/summary',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.CASHIER),
  cashRegisterController.getClosingSummary
);

router.post(
  '/close',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.CASHIER),
  validate(closeCashRegisterSchema),
  cashRegisterController.closeCashRegister
);

router.get(
  '/history',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.CASHIER),
  cashRegisterController.getClosingHistory
);

router.get(
  '/:id',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN, USER_ROLES.CASHIER),
  cashRegisterController.getClosingById
);

export default router;
