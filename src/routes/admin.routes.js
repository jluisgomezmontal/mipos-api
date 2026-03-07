import express from 'express';
import adminController from '../controllers/admin.controller.js';
import { authenticate, authorize } from '../middlewares/auth.js';
import { USER_ROLES } from '../utils/constants.js';

const router = express.Router();

// Todas las rutas requieren autenticación y rol SUPERUSER
router.use(authenticate);
router.use(authorize(USER_ROLES.SUPERUSER));

// Rutas de gestión de tenants
router.get('/tenants', adminController.getTenants);
router.get('/tenants/:id', adminController.getTenantById);
router.patch('/tenants/:id', adminController.updateTenant);
router.delete('/tenants/:id', adminController.deleteTenant);

export default router;
