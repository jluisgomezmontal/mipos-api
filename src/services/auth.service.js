import User from '../models/User.js';
import Tenant from '../models/Tenant.js';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors.js';
import { generateTokenPair, verifyRefreshToken } from '../utils/jwt.js';
import { USER_ROLES } from '../utils/constants.js';

class AuthService {
  async registerTenant(tenantData, ownerData) {
    const existingTenant = await Tenant.findOne({ email: tenantData.email });
    if (existingTenant) {
      throw new ConflictError('Tenant con este correo electrónico ya existe');
    }

    const tenant = await Tenant.create(tenantData);

    const existingUser = await User.findOne({
      tenantId: tenant._id,
      email: ownerData.email,
    });

    if (existingUser) {
      await Tenant.findByIdAndDelete(tenant._id);
      throw new ConflictError('User con este correo electrónico ya existe');
    }

    const owner = await User.create({
      ...ownerData,
      tenantId: tenant._id,
      role: USER_ROLES.OWNER,
    });

    const tokens = generateTokenPair(owner._id, tenant._id, owner.role);

    await User.findByIdAndUpdate(owner._id, {
      refreshToken: tokens.refreshToken,
      lastLogin: new Date(),
    });

    return {
      tenant,
      user: owner,
      tokens,
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    console.log(user)
    if (user.isActive === false) {
      throw new UnauthorizedError('El usuario está inactivo');
    }
    if (!user || !(await user.comparePassword(password))) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const tenant = await Tenant.findById(user.tenantId);
    if (!tenant || !tenant.isActive) {
      throw new UnauthorizedError('Tenant está inactivo');
    }

    const tokens = generateTokenPair(user._id, user.tenantId, user.role);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: tokens.refreshToken,
      lastLogin: new Date(),
    });

    return {
      user,
      tenant,
      tokens,
    };
  }

  async refreshToken(refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);

    const user = await User.findById(decoded.userId).select('+refreshToken');

    if (!user || !user.isActive || user.refreshToken !== refreshToken) {
      throw new UnauthorizedError('Token de actualización inválido');
    }

    const tokens = generateTokenPair(user._id, user.tenantId, user.role);

    await User.findByIdAndUpdate(user._id, {
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async createUser(tenantId, userData) {
    const existingUser = await User.findOne({
      tenantId,
      email: userData.email,
    });

    if (existingUser) {
      throw new ConflictError('User con este correo electrónico ya existe en este inquilino');
    }

    const user = await User.create({
      ...userData,
      tenantId,
    });

    return user;
  }

  async getUsersByTenant(tenantId, filters = {}) {
    const query = { tenantId, ...filters };
    const users = await User.find(query).select('-password -refreshToken');
    return users;
  }

  async updateUser(tenantId, userId, updateData) {
    const user = await User.findOne({ _id: userId, tenantId });

    if (!user) {
      throw new NotFoundError('User not found');
    }

    if (updateData.email) {
      const existingUser = await User.findOne({
        tenantId,
        email: updateData.email,
        _id: { $ne: userId },
      });

      if (existingUser) {
        throw new ConflictError('Email ya en uso');
      }
    }

    Object.assign(user, updateData);
    await user.save();

    return user;
  }

  async deleteUser(tenantId, userId) {
    const user = await User.findOne({ _id: userId, tenantId });

    if (!user) {
      throw new NotFoundError('Usuario no encontrado');
    }

    if (user.role === USER_ROLES.OWNER) {
      throw new ConflictError('No se puede eliminar el usuario dueño');
    }

    await User.findByIdAndUpdate(userId, { isActive: false });

    return user;
  }

  async updateTenant(tenantId, updateData) {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      throw new NotFoundError('Tenant no encontrado');
    }

    if (updateData.email && updateData.email !== tenant.email) {
      const existingTenant = await Tenant.findOne({
        email: updateData.email,
        _id: { $ne: tenantId },
      });

      if (existingTenant) {
        throw new ConflictError('Email ya en uso');
      }
    }

    if (updateData.taxId && updateData.taxId !== tenant.taxId) {
      const existingTenant = await Tenant.findOne({
        taxId: updateData.taxId,
        _id: { $ne: tenantId },
      });

      if (existingTenant) {
        throw new ConflictError('Tax ID ya en uso');
      }
    }

    Object.assign(tenant, updateData);
    await tenant.save();

    return tenant;
  }

  async updateTenantSettings(tenantId, settingsData) {
    const tenant = await Tenant.findById(tenantId);

    if (!tenant) {
      throw new NotFoundError('Tenant no encontrado');
    }

    tenant.settings = {
      ...tenant.settings,
      ...settingsData,
    };

    await tenant.save();

    return tenant;
  }
}

export default new AuthService();
