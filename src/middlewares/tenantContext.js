import { UnauthorizedError } from '../utils/errors.js';

export const injectTenantContext = (req, res, next) => {
  try {
    if (!req.user || !req.user.tenantId) {
      throw new UnauthorizedError('Tenant context not found');
    }

    req.tenantId = req.user.tenantId;

    next();
  } catch (error) {
    next(error);
  }
};

export const ensureTenantIsolation = (model) => {
  return async (req, res, next) => {
    try {
      if (!req.tenantId) {
        throw new UnauthorizedError('Tenant context required');
      }

      const originalFind = model.find;
      const originalFindOne = model.findOne;
      const originalFindById = model.findById;

      model.find = function (...args) {
        const query = args[0] || {};
        query.tenantId = req.tenantId;
        return originalFind.call(this, query, ...args.slice(1));
      };

      model.findOne = function (...args) {
        const query = args[0] || {};
        query.tenantId = req.tenantId;
        return originalFindOne.call(this, query, ...args.slice(1));
      };

      model.findById = function (id, ...args) {
        return originalFindOne.call(this, { _id: id, tenantId: req.tenantId }, ...args);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};
