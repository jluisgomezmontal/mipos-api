import reportService from '../services/report.service.js';
import { successResponse } from '../utils/response.js';

class ReportController {
  async getSalesReport(req, res, next) {
    try {
      const { startDate, endDate, branchId } = req.query;
      const report = await reportService.getSalesReport(req.tenantId, startDate, endDate, branchId);

      successResponse(res, report, 'Sales report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req, res, next) {
    try {
      const { startDate, endDate, branchId, limit = 10 } = req.query;
      const report = await reportService.getTopProducts(
        req.tenantId,
        startDate,
        endDate,
        branchId,
        parseInt(limit)
      );

      successResponse(res, report, 'Top products report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRevenueByBranch(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const report = await reportService.getRevenueByBranch(req.tenantId, startDate, endDate);

      successResponse(res, report, 'Revenue by branch report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPaymentMethodsReport(req, res, next) {
    try {
      const { startDate, endDate, branchId } = req.query;
      const paymentMethods = await reportService.getPaymentMethodsReport(
        req.tenantId,
        startDate,
        endDate,
        branchId
      );

      successResponse(res, { paymentMethods }, 'Payment methods report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const { branchId } = req.query;
      const stats = await reportService.getDashboardStats(req.tenantId, branchId);

      successResponse(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
