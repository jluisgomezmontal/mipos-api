import mongoose from 'mongoose';
import { INVENTORY_MOVEMENT_TYPE } from '../utils/constants.js';

const inventoryMovementSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch ID is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(INVENTORY_MOVEMENT_TYPE),
      required: [true, 'Movement type is required'],
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
    },
    previousQuantity: {
      type: Number,
      required: [true, 'Previous quantity is required'],
    },
    newQuantity: {
      type: Number,
      required: [true, 'New quantity is required'],
    },
    reason: {
      type: String,
      trim: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    referenceId: {
      type: mongoose.Schema.Types.ObjectId,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

inventoryMovementSchema.index({ tenantId: 1, productId: 1, createdAt: -1 });
inventoryMovementSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
inventoryMovementSchema.index({ tenantId: 1, type: 1, createdAt: -1 });
inventoryMovementSchema.index({ tenantId: 1, referenceId: 1 });

const InventoryMovement = mongoose.model('InventoryMovement', inventoryMovementSchema);

export default InventoryMovement;
