import authService from '../services/auth.service.js';
import { successResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class AuthController {
  async registerTenant(req, res, next) {
    try {
      const { tenant, owner } = req.body;
      const result = await authService.registerTenant(tenant, owner);

      successResponse(
        res,
        {
          tenant: result.tenant,
          user: result.user,
          tokens: result.tokens,
        },
        'Tenant registered successfully',
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);

      successResponse(
        res,
        {
          user: result.user,
          tenant: result.tenant,
          tokens: result.tokens,
        },
        'Login successful'
      );
    } catch (error) {
      next(error);
    }
  }

  async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await authService.refreshToken(refreshToken);

      successResponse(res, { tokens }, 'Token refreshed successfully');
    } catch (error) {
      next(error);
    }
  }

  async createUser(req, res, next) {
    try {
      const user = await authService.createUser(req.tenantId, req.body);

      successResponse(res, { user }, 'User created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getUsers(req, res, next) {
    try {
      const filters = {};
      if (req.query.role) filters.role = req.query.role;
      if (req.query.isActive !== undefined) filters.isActive = req.query.isActive === 'true';

      const users = await authService.getUsersByTenant(req.tenantId, filters);

      successResponse(res, { users }, 'Users retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateUser(req, res, next) {
    try {
      const user = await authService.updateUser(req.tenantId, req.params.id, req.body);

      successResponse(res, { user }, 'User updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await authService.deleteUser(req.tenantId, req.params.id);

      successResponse(res, null, 'User deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }

  async getMe(req, res, next) {
    try {
      const user = await authService.getUsersByTenant(req.tenantId, { _id: req.user.userId });

      successResponse(res, { user: user[0] }, 'User profile retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTenant(req, res, next) {
    try {
      const tenant = await authService.updateTenant(req.tenantId, req.body);

      successResponse(res, { tenant }, 'Tenant updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateTenantSettings(req, res, next) {
    try {
      const tenant = await authService.updateTenantSettings(req.tenantId, req.body);

      successResponse(res, { tenant }, 'Tenant settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
