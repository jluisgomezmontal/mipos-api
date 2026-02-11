import paymentService from '../services/payment.service.js';
import { successResponse } from '../utils/response.js';
import { HTTP_STATUS } from '../utils/constants.js';

class PaymentController {
  async createPayment(req, res, next) {
    try {
      const payment = await paymentService.createPayment(req.tenantId, req.user.userId, req.body);

      successResponse(res, { payment }, 'Payment processed successfully', HTTP_STATUS.CREATED);
    } catch (error) {
      next(error);
    }
  }

  async getPayments(req, res, next) {
    try {
      const payments = await paymentService.getPayments(req.tenantId, req.query);

      successResponse(res, { payments }, 'Payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPaymentById(req, res, next) {
    try {
      const payment = await paymentService.getPaymentById(req.tenantId, req.params.id);

      successResponse(res, { payment }, 'Payment retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async getPaymentsBySale(req, res, next) {
    try {
      const result = await paymentService.getPaymentsBySale(req.tenantId, req.params.saleId);

      successResponse(res, result, 'Sale payments retrieved successfully');
    } catch (error) {
      next(error);
    }
  }

  async refundPayment(req, res, next) {
    try {
      const payment = await paymentService.refundPayment(
        req.tenantId,
        req.params.id,
        req.user.userId
      );

      successResponse(res, { payment }, 'Payment refunded successfully');
    } catch (error) {
      next(error);
    }
  }
}

export default new PaymentController();
