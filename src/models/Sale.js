import mongoose from 'mongoose';
import { SALE_STATUS } from '../utils/constants.js';

const saleItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productSnapshot: {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    cost: { type: Number, default: 0 },
    taxRate: { type: Number, default: 0 },
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  unitPrice: {
    type: Number,
    required: [true, 'Unit price is required'],
    min: [0, 'Unit price cannot be negative'],
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
  },
  taxAmount: {
    type: Number,
    default: 0,
    min: [0, 'Tax amount cannot be negative'],
  },
  subtotal: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
}, { _id: false });

const saleSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    branchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Branch',
      required: [true, 'Branch ID is required'],
      index: true,
    },
    saleNumber: {
      type: String,
      required: [true, 'Sale number is required'],
      trim: true,
    },
    items: {
      type: [saleItemSchema],
      required: [true, 'Sale items are required'],
      validate: {
        validator: (items) => items.length > 0,
        message: 'Sale must have at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: [true, 'Subtotal is required'],
      min: [0, 'Subtotal cannot be negative'],
    },
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: [0, 'Tax amount cannot be negative'],
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(SALE_STATUS),
      default: SALE_STATUS.PENDING,
      index: true,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
    },
    customerInfo: {
      name: String,
      email: String,
      phone: String,
    },
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier ID is required'],
    },
    notes: {
      type: String,
      trim: true,
    },
    cancelledAt: {
      type: Date,
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    cancellationReason: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

saleSchema.index({ tenantId: 1, saleNumber: 1 }, { unique: true });
saleSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
saleSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
saleSchema.index({ tenantId: 1, cashierId: 1, createdAt: -1 });
saleSchema.index({ tenantId: 1, customerId: 1 });

const Sale = mongoose.model('Sale', saleSchema);

export default Sale;
