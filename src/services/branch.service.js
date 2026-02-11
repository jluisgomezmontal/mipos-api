import Branch from '../models/Branch.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

class BranchService {
  async createBranch(tenantId, branchData) {
    const existingBranch = await Branch.findOne({
      tenantId,
      code: branchData.code,
    });

    if (existingBranch) {
      throw new ConflictError('Branch with this code already exists');
    }

    const branch = await Branch.create({
      ...branchData,
      tenantId,
    });

    return branch;
  }

  async getBranches(tenantId, filters = {}) {
    const query = { tenantId };

    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive === 'true';
    }

    const branches = await Branch.find(query).populate('manager', 'firstName lastName email');

    return branches;
  }

  async getBranchById(tenantId, branchId) {
    const branch = await Branch.findOne({ _id: branchId, tenantId }).populate(
      'manager',
      'firstName lastName email'
    );

    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    return branch;
  }

  async updateBranch(tenantId, branchId, updateData) {
    const branch = await Branch.findOne({ _id: branchId, tenantId });

    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    if (updateData.code && updateData.code !== branch.code) {
      const existingBranch = await Branch.findOne({
        tenantId,
        code: updateData.code,
        _id: { $ne: branchId },
      });

      if (existingBranch) {
        throw new ConflictError('Branch with this code already exists');
      }
    }

    Object.assign(branch, updateData);
    await branch.save();

    return branch;
  }

  async deleteBranch(tenantId, branchId) {
    const branch = await Branch.findOne({ _id: branchId, tenantId });

    if (!branch) {
      throw new NotFoundError('Branch not found');
    }

    await Branch.findByIdAndUpdate(branchId, { isActive: false });

    return branch;
  }
}

export default new BranchService();
