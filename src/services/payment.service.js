import Payment from '../models/Payment.js';
import Sale from '../models/Sale.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import { PAYMENT_STATUS, SALE_STATUS } from '../utils/constants.js';
import mongoose from 'mongoose';

class PaymentService {
  async createPayment(tenantId, userId, paymentData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { saleId, method, amount, reference, metadata } = paymentData;

      const sale = await Sale.findOne({ _id: saleId, tenantId });

      if (!sale) {
        throw new NotFoundError('Sale not found');
      }

      if (sale.status === SALE_STATUS.CANCELLED) {
        throw new AppError('Cannot process payment for cancelled sale', 400);
      }

      if (sale.status === SALE_STATUS.PAID) {
        throw new AppError('Sale is already paid', 400);
      }

      const existingPayments = await Payment.find({
        tenantId,
        saleId,
        status: PAYMENT_STATUS.COMPLETED,
      });

      const totalPaid = existingPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const remainingAmount = sale.total - totalPaid;

      if (amount > remainingAmount) {
        throw new AppError(
          `Payment amount exceeds remaining balance. Remaining: ${remainingAmount}`,
          400
        );
      }

      const payment = await Payment.create(
        [
          {
            tenantId,
            saleId,
            method,
            amount,
            status: PAYMENT_STATUS.COMPLETED,
            reference,
            metadata,
            processedAt: new Date(),
            processedBy: userId,
          },
        ],
        { session }
      );

      const newTotalPaid = totalPaid + amount;

      if (newTotalPaid >= sale.total) {
        sale.status = SALE_STATUS.PAID;
        await sale.save({ session });
      }

      await session.commitTransaction();

      return payment[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getPayments(tenantId, filters = {}) {
    const { saleId, method, status, startDate, endDate } = filters;

    const query = { tenantId };

    if (saleId) {
      query.saleId = saleId;
    }

    if (method) {
      query.method = method;
    }

    if (status) {
      query.status = status;
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const payments = await Payment.find(query)
      .populate('saleId', 'saleNumber total status')
      .populate('processedBy', 'firstName lastName email')
      .sort({ createdAt: -1 });

    return payments;
  }

  async getPaymentById(tenantId, paymentId) {
    const payment = await Payment.findOne({ _id: paymentId, tenantId })
      .populate('saleId', 'saleNumber total status items')
      .populate('processedBy', 'firstName lastName email');

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    return payment;
  }

  async getPaymentsBySale(tenantId, saleId) {
    const sale = await Sale.findOne({ _id: saleId, tenantId });

    if (!sale) {
      throw new NotFoundError('Sale not found');
    }

    const payments = await Payment.find({ tenantId, saleId }).populate(
      'processedBy',
      'firstName lastName email'
    );

    const totalPaid = payments.reduce((sum, payment) => {
      if (payment.status === PAYMENT_STATUS.COMPLETED) {
        return sum + payment.amount;
      }
      return sum;
    }, 0);

    return {
      payments,
      summary: {
        saleTotal: sale.total,
        totalPaid,
        remainingBalance: sale.total - totalPaid,
        isPaid: sale.status === SALE_STATUS.PAID,
      },
    };
  }

  async refundPayment(tenantId, paymentId, userId) {
    const payment = await Payment.findOne({ _id: paymentId, tenantId });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.status === PAYMENT_STATUS.REFUNDED) {
      throw new AppError('Payment is already refunded', 400);
    }

    if (payment.status !== PAYMENT_STATUS.COMPLETED) {
      throw new AppError('Only completed payments can be refunded', 400);
    }

    payment.status = PAYMENT_STATUS.REFUNDED;
    await payment.save();

    const sale = await Sale.findById(payment.saleId);
    if (sale && sale.status === SALE_STATUS.PAID) {
      sale.status = SALE_STATUS.PENDING;
      await sale.save();
    }

    return payment;
  }
}

export default new PaymentService();
