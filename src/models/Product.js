import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Tenant',
      required: [true, 'El ID del tenant es requerido'],
      index: true,
    },
    sku: {
      type: String,
      required: [true, 'El SKU es requerido'],
      trim: true,
      uppercase: true,
    },
    name: {
      type: String,
      required: [true, 'El nombre del producto es requerido'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    price: {
      type: Number,
      required: [true, 'El precio es requerido'],
      min: [0, 'El precio no puede ser negativo'],
    },
    cost: {
      type: Number,
      default: 0,
      min: [0, 'El costo no puede ser negativo'],
    },
    taxRate: {
      type: Number,
      default: 0,
      min: [0, 'La tasa de impuesto no puede ser negativa'],
      max: [100, 'La tasa de impuesto no puede exceder el 100%'],
    },
    barcode: {
      type: String,
      trim: true,
      sparse: true,
    },
    image: {
      type: String,
    },
    attributes: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    trackInventory: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

productSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
productSchema.index({ tenantId: 1, barcode: 1 }, { sparse: true });
productSchema.index({ tenantId: 1, name: 'text', description: 'text' });
productSchema.index({ tenantId: 1, category: 1 });
productSchema.index({ tenantId: 1, isActive: 1 });

const Product = mongoose.model('Product', productSchema);

export default Product;
