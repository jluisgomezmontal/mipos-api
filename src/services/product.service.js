import Product from '../models/Product.js';
import { NotFoundError, ConflictError } from '../utils/errors.js';

class ProductService {
  async createProduct(tenantId, productData) {
    const existingProduct = await Product.findOne({
      tenantId,
      sku: productData.sku,
    });

    if (existingProduct) {
      throw new ConflictError('Product with this SKU already exists');
    }

    if (productData.barcode) {
      const existingBarcode = await Product.findOne({
        tenantId,
        barcode: productData.barcode,
      });

      if (existingBarcode) {
        throw new ConflictError('Product with this barcode already exists');
      }
    }

    const product = await Product.create({
      ...productData,
      tenantId,
    });

    return product;
  }

  async getProducts(tenantId, filters = {}, pagination = {}) {
    const { search, category, isActive, page = 1, limit = 20, sort = '-createdAt' } = { ...filters, ...pagination };

    const query = { tenantId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .sort(sort)
      .limit(limit)
      .skip((page - 1) * limit);

    return {
      products,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getProductById(tenantId, productId) {
    const product = await Product.findOne({ _id: productId, tenantId });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async updateProduct(tenantId, productId, updateData) {
    const product = await Product.findOne({ _id: productId, tenantId });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    if (updateData.sku && updateData.sku !== product.sku) {
      const existingProduct = await Product.findOne({
        tenantId,
        sku: updateData.sku,
        _id: { $ne: productId },
      });

      if (existingProduct) {
        throw new ConflictError('Product with this SKU already exists');
      }
    }

    if (updateData.barcode && updateData.barcode !== product.barcode) {
      const existingBarcode = await Product.findOne({
        tenantId,
        barcode: updateData.barcode,
        _id: { $ne: productId },
      });

      if (existingBarcode) {
        throw new ConflictError('Product with this barcode already exists');
      }
    }

    Object.assign(product, updateData);
    await product.save();

    return product;
  }

  async deleteProduct(tenantId, productId) {
    const product = await Product.findOne({ _id: productId, tenantId });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    await Product.findByIdAndUpdate(productId, { isActive: false });

    return product;
  }

  async getProductBySku(tenantId, sku) {
    const product = await Product.findOne({ tenantId, sku, isActive: true });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }

  async getProductByBarcode(tenantId, barcode) {
    const product = await Product.findOne({ tenantId, barcode, isActive: true });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    return product;
  }
}

export default new ProductService();
