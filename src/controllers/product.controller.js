import productService from '../services/product.service.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class ProductController {
  async createProduct(req, res, next) {
    try {
      const product = await productService.createProduct(req.tenantId, req.body);

      successResponse(res, { product }, 'Product created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getProducts(req, res, next) {
    try {
      const { products, pagination } = await productService.getProducts(
        req.tenantId,
        req.query,
        req.query
      );

      paginatedResponse(res, { products }, pagination, 'Products retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProductById(req, res, next) {
    try {
      const product = await productService.getProductById(req.tenantId, req.params.id);

      successResponse(res, { product }, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async updateProduct(req, res, next) {
    try {
      const product = await productService.updateProduct(req.tenantId, req.params.id, req.body);

      successResponse(res, { product }, 'Product updated successfully');
    } catch (error) {
      next(error);
    }
  }

  async deleteProduct(req, res, next) {
    try {
      await productService.deleteProduct(req.tenantId, req.params.id);

      successResponse(res, null, 'Product deleted successfully', HTTP_STATUS.NO_CONTENT);
    } catch (error) {
      next(error);
    }
  }

  async getProductBySku(req, res, next) {
    try {
      const product = await productService.getProductBySku(req.tenantId, req.params.sku);

      successResponse(res, { product }, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getProductByBarcode(req, res, next) {
    try {
      const product = await productService.getProductByBarcode(req.tenantId, req.params.barcode);

      successResponse(res, { product }, 'Product retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductController();
