import mongoose from 'mongoose';
import { CASH_REGISTER_STATUS } from '../utils/constants.js';

const withdrawalSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: [true, 'Withdrawal amount is required'],
    min: [0, 'Withdrawal amount cannot be negative'],
  },
  reason: {
    type: String,
    required: [true, 'Withdrawal reason is required'],
    trim: true,
  },
  withdrawnBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  withdrawnAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const cashRegisterClosingSchema = new mongoose.Schema(
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
    cashierId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Cashier ID is required'],
      index: true,
    },
    closingNumber: {
      type: String,
      required: [true, 'Closing number is required'],
      trim: true,
      unique: true,
    },
    openedAt: {
      type: Date,
      required: [true, 'Opening time is required'],
      default: Date.now,
    },
    closedAt: {
      type: Date,
    },
    initialCash: {
      type: Number,
      required: [true, 'Initial cash is required'],
      min: [0, 'Initial cash cannot be negative'],
    },
    finalCash: {
      type: Number,
      min: [0, 'Final cash cannot be negative'],
    },
    withdrawals: {
      type: [withdrawalSchema],
      default: [],
    },
    totalWithdrawals: {
      type: Number,
      default: 0,
      min: [0, 'Total withdrawals cannot be negative'],
    },
    expectedCash: {
      type: Number,
      default: 0,
    },
    difference: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: Object.values(CASH_REGISTER_STATUS),
      default: CASH_REGISTER_STATUS.OPEN,
      index: true,
    },
    sales: {
      totalSales: { type: Number, default: 0 },
      totalRevenue: { type: Number, default: 0 },
      averageTicket: { type: Number, default: 0 },
    },
    payments: {
      cash: {
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
      },
      card: {
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
      },
      transfer: {
        count: { type: Number, default: 0 },
        amount: { type: Number, default: 0 },
      },
    },
    notes: {
      type: String,
      trim: true,
    },
    closedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

cashRegisterClosingSchema.index({ tenantId: 1, closingNumber: 1 }, { unique: true });
cashRegisterClosingSchema.index({ tenantId: 1, branchId: 1, createdAt: -1 });
cashRegisterClosingSchema.index({ tenantId: 1, cashierId: 1, createdAt: -1 });
cashRegisterClosingSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

const CashRegisterClosing = mongoose.model('CashRegisterClosing', cashRegisterClosingSchema);

export default CashRegisterClosing;
