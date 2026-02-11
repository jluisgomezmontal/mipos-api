import inventoryService from '../services/inventory.service.js';
import { successResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class InventoryController {
  async getInventory(req, res, next) {
    try {
      const inventory = await inventoryService.getInventory(req.tenantId, req.query);

      successResponse(res, { inventory }, 'Inventory retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getInventoryByProductAndBranch(req, res, next) {
    try {
      const { productId, branchId } = req.params;
      const inventory = await inventoryService.getInventoryByProductAndBranch(
        req.tenantId,
        productId,
        branchId
      );

      successResponse(res, { inventory }, 'Inventory retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async createInventoryMovement(req, res, next) {
    try {
      const result = await inventoryService.createInventoryMovement(
        req.tenantId,
        req.user.userId,
        req.body
      );

      successResponse(
        res,
        { inventory: result.inventory, movement: result.movement },
        'Inventory movement created successfully',
        HTTP_STATUS.CREATED
      );
    } catch (error) {
      next(error);
    }
  }

  async getInventoryMovements(req, res, next) {
    try {
      const movements = await inventoryService.getInventoryMovements(req.tenantId, req.query);

      successResponse(res, { movements }, 'Inventory movements retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateInventorySettings(req, res, next) {
    try {
      const { productId, branchId } = req.params;
      const inventory = await inventoryService.updateInventorySettings(
        req.tenantId,
        productId,
        branchId,
        req.body
      );

      successResponse(res, { inventory }, 'Inventory settings updated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new InventoryController();
