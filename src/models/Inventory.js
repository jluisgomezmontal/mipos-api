import mongoose from 'mongoose';

const inventorySchema = new mongoose.Schema(
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
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    minStock: {
      type: Number,
      default: 0,
      min: [0, 'Minimum stock cannot be negative'],
    },
    maxStock: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

inventorySchema.index({ tenantId: 1, productId: 1, branchId: 1 }, { unique: true });
inventorySchema.index({ tenantId: 1, branchId: 1 });
inventorySchema.index({ tenantId: 1, productId: 1 });

const Inventory = mongoose.model('Inventory', inventorySchema);

export default Inventory;
