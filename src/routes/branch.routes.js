import express from 'express';
import branchController from '../controllers/branch.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { injectTenantContext } from '../middlewares/tenantContext.js';
import { createBranchSchema, updateBranchSchema } from '../validators/branch.validator.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

router.use(authenticate);
router.use(injectTenantContext);

router.post(
  '/',
  authorize(USER_ROLES.OWNER),
  validate(createBranchSchema),
  branchController.createBranch
);

router.get('/', branchController.getBranches);

router.get('/:id', branchController.getBranchById);

router.patch(
  '/:id',
  authorize(USER_ROLES.OWNER),
  validate(updateBranchSchema),
  branchController.updateBranch
);

router.delete('/:id', authorize(USER_ROLES.OWNER), branchController.deleteBranch);

export default router;
