import CashRegisterClosing from '../models/CashRegisterClosing.js';
import Sale from '../models/Sale.js';
import Payment from '../models/Payment.js';
import Branch from '../models/Branch.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import { CASH_REGISTER_STATUS, PAYMENT_METHOD, PAYMENT_STATUS, SALE_STATUS, USER_ROLES } from '../utils/constants.js';
import mongoose from 'mongoose';

class CashRegisterService {
  async generateClosingNumber(tenantId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const lastClosing = await CashRegisterClosing.findOne({
      tenantId,
      closingNumber: new RegExp(`^${datePrefix}`),
    })
      .sort({ closingNumber: -1 })
      .limit(1);

    let sequence = 1;
    if (lastClosing) {
      const lastSequence = parseInt(lastClosing.closingNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${datePrefix}${String(sequence).padStart(4, '0')}`;
  }

  async openCashRegister(tenantId, userId, data) {
    const { branchId, initialCash } = data;

    const branch = await Branch.findOne({ _id: branchId, tenantId, isActive: true });
    if (!branch) {
      throw new NotFoundError('Branch not found or inactive');
    }

    const existingOpen = await CashRegisterClosing.findOne({
      tenantId,
      cashierId: userId,
      status: CASH_REGISTER_STATUS.OPEN,
    });

    if (existingOpen) {
      throw new AppError('You already have an open cash register', 400);
    }

    const closingNumber = await this.generateClosingNumber(tenantId);

    const cashRegister = await CashRegisterClosing.create({
      tenantId,
      branchId,
      cashierId: userId,
      closingNumber,
      initialCash,
      openedAt: new Date(),
      status: CASH_REGISTER_STATUS.OPEN,
    });

    return cashRegister;
  }

  async getCurrentOpenRegister(tenantId, userId, userRole) {
    const query = {
      tenantId,
      cashierId: userId,
      status: CASH_REGISTER_STATUS.OPEN,
    };

    const cashRegister = await CashRegisterClosing.findOne(query)
      .populate('branchId', 'name code')
      .populate('cashierId', 'firstName lastName email')
      .populate('withdrawals.withdrawnBy', 'firstName lastName');

    if (!cashRegister) {
      return null;
    }

    // Calcular ventas y pagos en tiempo real
    const sales = await Sale.find({
      tenantId,
      cashierId: cashRegister.cashierId,
      createdAt: {
        $gte: cashRegister.openedAt,
      },
      status: { $ne: SALE_STATUS.CANCELLED },
    });

    const saleIds = sales.map((s) => s._id);

    const payments = await Payment.find({
      tenantId,
      saleId: { $in: saleIds },
      status: PAYMENT_STATUS.COMPLETED,
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const paymentsByMethod = payments.reduce(
      (acc, payment) => {
        const method = payment.method.toLowerCase();
        if (acc[method]) {
          acc[method].count += 1;
          acc[method].amount += payment.amount;
        }
        return acc;
      },
      {
        cash: { count: 0, amount: 0 },
        card: { count: 0, amount: 0 },
        transfer: { count: 0, amount: 0 },
      }
    );

    // Actualizar los datos del registro
    cashRegister.sales = {
      totalSales,
      totalRevenue,
      averageTicket,
    };
    cashRegister.payments = paymentsByMethod;

    return cashRegister;
  }

  async addWithdrawal(tenantId, userId, data) {
    const { amount, reason } = data;

    const cashRegister = await CashRegisterClosing.findOne({
      tenantId,
      cashierId: userId,
      status: CASH_REGISTER_STATUS.OPEN,
    });

    if (!cashRegister) {
      throw new NotFoundError('No open cash register found');
    }

    const withdrawal = {
      amount,
      reason,
      withdrawnBy: userId,
      withdrawnAt: new Date(),
    };

    cashRegister.withdrawals.push(withdrawal);
    cashRegister.totalWithdrawals = cashRegister.withdrawals.reduce(
      (sum, w) => sum + w.amount,
      0
    );

    await cashRegister.save();

    return cashRegister;
  }

  async calculateClosingSummary(tenantId, cashRegisterId) {
    const cashRegister = await CashRegisterClosing.findOne({
      _id: cashRegisterId,
      tenantId,
    });

    if (!cashRegister) {
      throw new NotFoundError('Cash register not found');
    }

    if (cashRegister.status === CASH_REGISTER_STATUS.CLOSED) {
      throw new AppError('Cash register is already closed', 400);
    }

    const sales = await Sale.find({
      tenantId,
      cashierId: cashRegister.cashierId,
      createdAt: {
        $gte: cashRegister.openedAt,
      },
      status: { $ne: SALE_STATUS.CANCELLED },
    });

    const saleIds = sales.map((s) => s._id);

    const payments = await Payment.find({
      tenantId,
      saleId: { $in: saleIds },
      status: PAYMENT_STATUS.COMPLETED,
    });

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const averageTicket = totalSales > 0 ? totalRevenue / totalSales : 0;

    const paymentsByMethod = payments.reduce(
      (acc, payment) => {
        const method = payment.method.toLowerCase();
        if (acc[method]) {
          acc[method].count += 1;
          acc[method].amount += payment.amount;
        }
        return acc;
      },
      {
        cash: { count: 0, amount: 0 },
        card: { count: 0, amount: 0 },
        transfer: { count: 0, amount: 0 },
      }
    );

    const expectedCash =
      cashRegister.initialCash +
      paymentsByMethod.cash.amount -
      cashRegister.totalWithdrawals;

    return {
      sales: {
        totalSales,
        totalRevenue,
        averageTicket,
      },
      payments: paymentsByMethod,
      withdrawals: {
        count: cashRegister.withdrawals.length,
        total: cashRegister.totalWithdrawals,
        items: cashRegister.withdrawals,
      },
      initialCash: cashRegister.initialCash,
      expectedCash,
      totalWithdrawals: cashRegister.totalWithdrawals,
    };
  }

  async closeCashRegister(tenantId, userId, userRole, data) {
    const { cashRegisterId, finalCash, notes } = data;

    const cashRegister = await CashRegisterClosing.findOne({
      _id: cashRegisterId,
      tenantId,
    });

    if (!cashRegister) {
      throw new NotFoundError('Cash register not found');
    }

    if (cashRegister.status === CASH_REGISTER_STATUS.CLOSED) {
      throw new AppError('Cash register is already closed', 400);
    }

    if (
      userRole === USER_ROLES.CASHIER &&
      cashRegister.cashierId.toString() !== userId.toString()
    ) {
      throw new AppError('You can only close your own cash register', 403);
    }

    const summary = await this.calculateClosingSummary(tenantId, cashRegisterId);

    cashRegister.sales = summary.sales;
    cashRegister.payments = summary.payments;
    cashRegister.finalCash = finalCash;
    cashRegister.expectedCash = summary.expectedCash;
    cashRegister.difference = finalCash - summary.expectedCash;
    cashRegister.status = CASH_REGISTER_STATUS.CLOSED;
    cashRegister.closedAt = new Date();
    cashRegister.closedBy = userId;
    cashRegister.notes = notes;

    await cashRegister.save();

    return cashRegister;
  }

  async getClosingHistory(tenantId, userId, userRole, filters = {}, pagination = {}) {
    const { branchId, cashierId, startDate, endDate, page = 1, limit = 20 } = {
      ...filters,
      ...pagination,
    };

    const query = { tenantId };

    if (userRole === USER_ROLES.CASHIER) {
      query.cashierId = userId;
    } else if (cashierId) {
      query.cashierId = cashierId;
    }

    if (branchId) {
      query.branchId = branchId;
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

    const total = await CashRegisterClosing.countDocuments(query);
    const closings = await CashRegisterClosing.find(query)
      .populate('branchId', 'name code')
      .populate('cashierId', 'firstName lastName email')
      .populate('closedBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return {
      closings,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getClosingById(tenantId, userId, userRole, closingId) {
    const query = { _id: closingId, tenantId };

    if (userRole === USER_ROLES.CASHIER) {
      query.cashierId = userId;
    }

    const closing = await CashRegisterClosing.findOne(query)
      .populate('branchId', 'name code address')
      .populate('cashierId', 'firstName lastName email')
      .populate('closedBy', 'firstName lastName email')
      .populate('withdrawals.withdrawnBy', 'firstName lastName email');

    if (!closing) {
      throw new NotFoundError('Cash register closing not found');
    }

    const sales = await Sale.find({
      tenantId,
      cashierId: closing.cashierId,
      createdAt: {
        $gte: closing.openedAt,
        ...(closing.closedAt && { $lte: closing.closedAt }),
      },
      status: { $ne: SALE_STATUS.CANCELLED },
    })
      .select('saleNumber total status createdAt')
      .sort({ createdAt: -1 });

    return {
      closing,
      sales,
    };
  }
}

export default new CashRegisterService();
