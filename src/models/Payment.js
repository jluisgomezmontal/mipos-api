import mongoose from 'mongoose';
import { PAYMENT_METHOD, PAYMENT_STATUS } from '../utils/constants.js';

const paymentSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    saleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sale',
      required: [true, 'Sale ID is required'],
      index: true,
    },
    method: {
      type: String,
      enum: Object.values(PAYMENT_METHOD),
      required: [true, 'Payment method is required'],
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
      index: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    externalId: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    processedAt: {
      type: Date,
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

paymentSchema.index({ tenantId: 1, saleId: 1 });
paymentSchema.index({ tenantId: 1, method: 1, createdAt: -1 });
paymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ tenantId: 1, externalId: 1 }, { sparse: true });

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
