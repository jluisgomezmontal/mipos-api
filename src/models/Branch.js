import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'Tenant ID is required'],
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Branch name is required'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Branch code is required'],
      trim: true,
      uppercase: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    manager: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

branchSchema.index({ tenantId: 1, code: 1 }, { unique: true });
branchSchema.index({ tenantId: 1, isActive: 1 });

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
