import reportService from '../services/report.service.js';
import { successResponse } from '../utils/response.js';

class ReportController {
  async getSalesReport(req, res, next) {
    try {
      const { startDate, endDate, branchId, userId } = req.query;
      const report = await reportService.getSalesReport(req.tenantId, startDate, endDate, branchId, req.user, userId);

      successResponse(res, report, 'Sales report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getTopProducts(req, res, next) {
    try {
      const { startDate, endDate, branchId, limit = 10, userId } = req.query;
      const report = await reportService.getTopProducts(
        req.tenantId,
        startDate,
        endDate,
        branchId,
        parseInt(limit),
        req.user,
        userId
      );

      successResponse(res, report, 'Top products report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getRevenueByBranch(req, res, next) {
    try {
      const { startDate, endDate, userId } = req.query;
      const report = await reportService.getRevenueByBranch(req.tenantId, startDate, endDate, req.user, userId);

      successResponse(res, report, 'Revenue by branch report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPaymentMethodsReport(req, res, next) {
    try {
      const { startDate, endDate, branchId, userId } = req.query;
      const paymentMethods = await reportService.getPaymentMethodsReport(
        req.tenantId,
        startDate,
        endDate,
        branchId,
        req.user,
        userId
      );

      successResponse(res, { paymentMethods }, 'Payment methods report generated successfully');
    } catch (error) {
      next(error);
    }
  }

  async getDashboardStats(req, res, next) {
    try {
      const { branchId, userId } = req.query;
      const stats = await reportService.getDashboardStats(req.tenantId, branchId, req.user, userId);

      successResponse(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getSalesByUser(req, res, next) {
    try {
      const { startDate, endDate, branchId } = req.query;
      const report = await reportService.getSalesByUser(req.tenantId, startDate, endDate, branchId, req.user);

      successResponse(res, report, 'Sales by user report generated successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new ReportController();
