import mongoose from 'mongoose';

const tenantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tenant name is required'],
      trim: true,
      maxlength: [100, 'Tenant name cannot exceed 100 characters'],
    },
    businessName: {
      type: String,
      required: [true, 'Business name is required'],
      trim: true,
    },
    taxId: {
      type: String,
      trim: true,
      sparse: true,
      unique: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
    },
    settings: {
      currency: {
        type: String,
        default: 'MXN',
      },
      timezone: {
        type: String,
        default: 'America/Mexico_City',
      },
      taxRate: {
        type: Number,
        default: 16,
        min: 0,
        max: 100,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    subscription: {
      plan: {
        type: String,
        enum: ['FREE', 'BASIC', 'PREMIUM', 'ENTERPRISE'],
        default: 'FREE',
      },
      expiresAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

tenantSchema.index({ email: 1 });
tenantSchema.index({ isActive: 1 });

const Tenant = mongoose.model('Tenant', tenantSchema);

export default Tenant;
