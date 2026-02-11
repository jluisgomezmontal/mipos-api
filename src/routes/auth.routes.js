import express from 'express';
import authController from '../controllers/auth.controller.js';
import { validate } from '../middlewares/validate.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { injectTenantContext } from '../middlewares/tenantContext.js';
import {
  registerTenantSchema,
  loginSchema,
  refreshTokenSchema,
  createUserSchema,
  updateTenantSchema,
  updateTenantSettingsSchema,
} from '../validators/auth.validator.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

router.post('/register', validate(registerTenantSchema), authController.registerTenant);
router.post('/login', validate(loginSchema), authController.login);
router.post('/refresh-token', validate(refreshTokenSchema), authController.refreshToken);

router.use(authenticate);
router.use(injectTenantContext);

router.get('/me', authController.getMe);

router.patch(
  '/tenant',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(updateTenantSchema),
  authController.updateTenant
);

router.patch(
  '/tenant/settings',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(updateTenantSettingsSchema),
  authController.updateTenantSettings
);

router.post(
  '/users',
  authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN),
  validate(createUserSchema),
  authController.createUser
);

router.get('/users', authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN), authController.getUsers);

router.patch('/users/:id', authorize(USER_ROLES.OWNER, USER_ROLES.ADMIN), authController.updateUser);

router.delete('/users/:id', authorize(USER_ROLES.OWNER), authController.deleteUser);

export default router;
