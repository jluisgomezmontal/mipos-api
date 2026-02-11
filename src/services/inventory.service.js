import Inventory from '../models/Inventory.js';
import InventoryMovement from '../models/InventoryMovement.js';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import { INVENTORY_MOVEMENT_TYPE } from '../utils/constants.js';
import mongoose from 'mongoose';

class InventoryService {
  async getInventory(tenantId, filters = {}) {
    const query = { tenantId };

    if (filters.branchId) {
      query.branchId = filters.branchId;
    }

    if (filters.productId) {
      query.productId = filters.productId;
    }

    if (filters.lowStock === 'true') {
      query.$expr = { $lte: ['$quantity', '$minStock'] };
    }

    const inventory = await Inventory.find(query)
      .populate('productId', 'sku name price category')
      .populate('branchId', 'name code');

    return inventory;
  }

  async getInventoryByProductAndBranch(tenantId, productId, branchId) {
    const inventory = await Inventory.findOne({
      tenantId,
      productId,
      branchId,
    })
      .populate('productId', 'sku name price category')
      .populate('branchId', 'name code');

    if (!inventory) {
      throw new NotFoundError('Inventory record not found');
    }

    return inventory;
  }

  async createOrUpdateInventory(tenantId, productId, branchId, quantity) {
    let inventory = await Inventory.findOne({
      tenantId,
      productId,
      branchId,
    });

    if (inventory) {
      inventory.quantity = quantity;
      await inventory.save();
    } else {
      inventory = await Inventory.create({
        tenantId,
        productId,
        branchId,
        quantity,
      });
    }

    return inventory;
  }

  async createInventoryMovement(tenantId, userId, movementData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { productId, branchId, type, quantity, reason, reference } = movementData;

      const product = await Product.findOne({ _id: productId, tenantId });
      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (!product.trackInventory) {
        throw new AppError('Product does not track inventory', 400);
      }

      const branch = await Branch.findOne({ _id: branchId, tenantId });
      if (!branch) {
        throw new NotFoundError('Branch not found');
      }

      let inventory = await Inventory.findOne({
        tenantId,
        productId,
        branchId,
      });

      const previousQuantity = inventory ? inventory.quantity : 0;
      let newQuantity = previousQuantity;

      if (type === INVENTORY_MOVEMENT_TYPE.IN) {
        newQuantity = previousQuantity + quantity;
      } else if (type === INVENTORY_MOVEMENT_TYPE.OUT) {
        newQuantity = previousQuantity - quantity;
        if (newQuantity < 0) {
          throw new AppError('Insufficient inventory', 400);
        }
      } else if (type === INVENTORY_MOVEMENT_TYPE.ADJUSTMENT) {
        newQuantity = quantity;
      }

      if (inventory) {
        inventory.quantity = newQuantity;
        await inventory.save({ session });
      } else {
        inventory = await Inventory.create(
          [
            {
              tenantId,
              productId,
              branchId,
              quantity: newQuantity,
            },
          ],
          { session }
        );
        inventory = inventory[0];
      }

      const movement = await InventoryMovement.create(
        [
          {
            tenantId,
            productId,
            branchId,
            type,
            quantity: type === INVENTORY_MOVEMENT_TYPE.ADJUSTMENT ? newQuantity : quantity,
            previousQuantity,
            newQuantity,
            reason,
            reference,
            userId,
          },
        ],
        { session }
      );

      await session.commitTransaction();

      return {
        inventory,
        movement: movement[0],
      };
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getInventoryMovements(tenantId, filters = {}) {
    const query = { tenantId };

    if (filters.branchId) {
      query.branchId = filters.branchId;
    }

    if (filters.productId) {
      query.productId = filters.productId;
    }

    if (filters.type) {
      query.type = filters.type;
    }

    const movements = await InventoryMovement.find(query)
      .populate('productId', 'sku name')
      .populate('branchId', 'name code')
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(100);

    return movements;
  }

  async updateInventorySettings(tenantId, productId, branchId, settings) {
    const inventory = await Inventory.findOne({
      tenantId,
      productId,
      branchId,
    });

    if (!inventory) {
      throw new NotFoundError('Inventory record not found');
    }

    Object.assign(inventory, settings);
    await inventory.save();

    return inventory;
  }

  async adjustInventoryForSale(tenantId, branchId, items, saleId, userId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const movements = [];

      for (const item of items) {
        const product = await Product.findOne({ _id: item.productId, tenantId });

        if (!product || !product.trackInventory) {
          continue;
        }

        const inventory = await Inventory.findOne({
          tenantId,
          productId: item.productId,
          branchId,
        });

        if (!inventory || inventory.quantity < item.quantity) {
          throw new AppError(`Insufficient inventory for product: ${product.name}`, 400);
        }

        const previousQuantity = inventory.quantity;
        const newQuantity = previousQuantity - item.quantity;

        inventory.quantity = newQuantity;
        await inventory.save({ session });

        const movement = await InventoryMovement.create(
          [
            {
              tenantId,
              productId: item.productId,
              branchId,
              type: INVENTORY_MOVEMENT_TYPE.SALE,
              quantity: item.quantity,
              previousQuantity,
              newQuantity,
              reference: 'Sale',
              referenceId: saleId,
              userId,
            },
          ],
          { session }
        );

        movements.push(movement[0]);
      }

      await session.commitTransaction();

      return movements;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
}

export default new InventoryService();
