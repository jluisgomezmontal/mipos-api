import saleService from '../services/sale.service.js';
import { successResponse, paginatedResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class SaleController {
  async createSale(req, res, next) {
    try {
      const sale = await saleService.createSale(req.tenantId, req.user.userId, req.body);

      successResponse(res, { sale }, 'Sale created successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getSales(req, res, next) {
    try {
      const { sales, pagination } = await saleService.getSales(
        req.tenantId,
        req.query,
        req.query,
        req.user
      );

      paginatedResponse(res, { sales }, pagination, 'Sales retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSaleById(req, res, next) {
    try {
      const sale = await saleService.getSaleById(req.tenantId, req.params.id);

      successResponse(res, { sale }, 'Sale retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async cancelSale(req, res, next) {
    try {
      const { cancellationReason } = req.body;
      const sale = await saleService.cancelSale(
        req.tenantId,
        req.params.id,
        req.user.userId,
        cancellationReason
      );

      successResponse(res, { sale }, 'Sale cancelled successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSalesToday(req, res, next) {
    try {
      const { branchId } = req.query;
      const result = await saleService.getSalesToday(req.tenantId, branchId);

      successResponse(res, result, 'Today sales retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new SaleController();
