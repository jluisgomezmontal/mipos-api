import branchService from '../services/branch.service.js';
import { successResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class BranchController {
  async createBranch(req, res, next) {
    try {
      const branch = await branchService.createBranch(req.tenantId, req.body);

      successResponse(res, { branch }, 'Branch created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getBranches(req, res, next) {
    try {
      const branches = await branchService.getBranches(req.tenantId, req.query);

      successResponse(res, { branches }, 'Branches retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getBranchById(req, res, next) {
    try {
      const branch = await branchService.getBranchById(req.tenantId, req.params.id);

      successResponse(res, { branch }, 'Branch retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateBranch(req, res, next) {
    try {
      const branch = await branchService.updateBranch(req.tenantId, req.params.id, req.body);

      successResponse(res, { branch }, 'Branch updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteBranch(req, res, next) {
    try {
      await branchService.deleteBranch(req.tenantId, req.params.id);

      successResponse(res, null, 'Branch deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }
}

export default new BranchController();
