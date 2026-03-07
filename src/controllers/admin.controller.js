import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import { NotFoundError } from '../utils/errors.js';
import { successResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class AdminController {
  async getTenants(req, res, next) {
    try {
      const { search, isActive, plan, page = 1, limit = 10, sort = '-createdAt' } = req.query;

      const query = {};

      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { businessName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ];
      }

      if (isActive !== undefined) {
        query.isActive = isActive === 'true';
      }

      if (plan) {
        query['subscription.plan'] = plan;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [tenants, total] = await Promise.all([
        Tenant.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Tenant.countDocuments(query),
      ]);

      const tenantsWithOwners = await Promise.all(
        tenants.map(async (tenant) => {
          const owner = await User.findOne({ 
            tenantId: tenant._id, 
            role: 'OWNER' 
          }).select('firstName lastName email').lean();

          const userCount = await User.countDocuments({ tenantId: tenant._id });

          return {
            ...tenant,
            owner: owner || null,
            stats: {
              totalUsers: userCount,
              totalBranches: 0,
              totalProducts: 0,
            },
          };
        })
      );

      successResponse(
        res,
        {
          tenants: tenantsWithOwners,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            totalPages: Math.ceil(total / parseInt(limit)),
          },
        },
        'Tenants retrieved successfully',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  async getTenantById(req, res, next) {
    try {
      const { id } = req.params;

      const tenant = await Tenant.findById(id).lean();

      if (!tenant) {
        throw new NotFoundError('Tenant no encontrado');
      }

      const owner = await User.findOne({ 
        tenantId: tenant._id, 
        role: 'OWNER' 
      }).select('firstName lastName email').lean();

      const userCount = await User.countDocuments({ tenantId: tenant._id });

      successResponse(
        res,
        {
          tenant: {
            ...tenant,
            owner: owner || null,
            stats: {
              totalUsers: userCount,
              totalBranches: 0,
              totalProducts: 0,
            },
          },
        },
        'Tenant retrieved successfully',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  async updateTenant(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const tenant = await Tenant.findByIdAndUpdate(
        id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!tenant) {
        throw new NotFoundError('Tenant no encontrado');
      }

      successResponse(
        res,
        { tenant },
        'Tenant actualizado exitosamente',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }

  async deleteTenant(req, res, next) {
    try {
      const { id } = req.params;

      const tenant = await Tenant.findByIdAndUpdate(
        id,
        { isActive: false },
        { new: true }
      );

      if (!tenant) {
        throw new NotFoundError('Tenant no encontrado');
      }

      successResponse(
        res,
        null,
        'Tenant desactivado exitosamente',
        HTTP_STATUS.OK
      );
    } catch (error) {
      next(error);
    }
  }
}

export default new AdminController();
