import Sale from '../models/Sale.js';
import Product from '../models/Product.js';
import Branch from '../models/Branch.js';
import Tenant from '../models/Tenant.js';
import inventoryService from './inventory.service.js';
import { NotFoundError, AppError } from '../utils/errors.js';
import { SALE_STATUS } from '../utils/constants.js';
import mongoose from 'mongoose';

class SaleService {
  async generateSaleNumber(tenantId) {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const datePrefix = `${year}${month}${day}`;

    const lastSale = await Sale.findOne({
      tenantId,
      saleNumber: new RegExp(`^${datePrefix}`),
    })
      .sort({ saleNumber: -1 })
      .limit(1);

    let sequence = 1;
    if (lastSale) {
      const lastSequence = parseInt(lastSale.saleNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    return `${datePrefix}${String(sequence).padStart(4, '0')}`;
  }

  async createSale(tenantId, userId, saleData) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { branchId, items, discount = 0, customerId, customerInfo, notes } = saleData;

      const branch = await Branch.findOne({ _id: branchId, tenantId, isActive: true });
      if (!branch) {
        throw new NotFoundError('Branch not found or inactive');
      }

      const tenant = await Tenant.findById(tenantId);
      const taxRate = tenant.settings?.taxRate || 0;

      const processedItems = [];
      let subtotal = 0;

      for (const item of items) {
        const product = await Product.findOne({
          _id: item.productId,
          tenantId,
          isActive: true,
        });

        if (!product) {
          throw new NotFoundError(`Product not found: ${item.productId}`);
        }

        const unitPrice = item.unitPrice || product.price;
        const itemDiscount = item.discount || 0;
        const itemSubtotal = unitPrice * item.quantity - itemDiscount;
        const itemTaxRate = product.taxRate || taxRate;
        const itemTaxAmount = (itemSubtotal * itemTaxRate) / 100;
        const itemTotal = itemSubtotal + itemTaxAmount;

        processedItems.push({
          productId: product._id,
          productSnapshot: {
            sku: product.sku,
            name: product.name,
            price: product.price,
            cost: product.cost || 0,
            taxRate: itemTaxRate,
          },
          quantity: item.quantity,
          unitPrice,
          discount: itemDiscount,
          taxAmount: itemTaxAmount,
          subtotal: itemSubtotal,
          total: itemTotal,
        });

        subtotal += itemSubtotal;
      }

      const totalTaxAmount = processedItems.reduce((sum, item) => sum + item.taxAmount, 0);
      const total = subtotal + totalTaxAmount - discount;

      const saleNumber = await this.generateSaleNumber(tenantId);

      const sale = await Sale.create(
        [
          {
            tenantId,
            branchId,
            saleNumber,
            items: processedItems,
            subtotal,
            discount,
            taxAmount: totalTaxAmount,
            total,
            status: SALE_STATUS.PENDING,
            customerId,
            customerInfo,
            cashierId: userId,
            notes,
          },
        ],
        { session }
      );

      await inventoryService.adjustInventoryForSale(
        tenantId,
        branchId,
        processedItems,
        sale[0]._id,
        userId
      );

      await session.commitTransaction();

      return sale[0];
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  async getSales(tenantId, filters = {}, pagination = {}) {
    const { branchId, status, startDate, endDate, page = 1, limit = 20 } = {
      ...filters,
      ...pagination,
    };

    const query = { tenantId };

    if (branchId) {
      query.branchId = branchId;
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

    const total = await Sale.countDocuments(query);
    const sales = await Sale.find(query)
      .populate('branchId', 'name code')
      .populate('cashierId', 'firstName lastName email')
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    return {
      sales,
      pagination: {
        page,
        limit,
        total,
      },
    };
  }

  async getSaleById(tenantId, saleId) {
    const sale = await Sale.findOne({ _id: saleId, tenantId })
      .populate('branchId', 'name code address')
      .populate('cashierId', 'firstName lastName email')
      .populate('customerId', 'name email phone');

    if (!sale) {
      throw new NotFoundError('Sale not found');
    }

    return sale;
  }

  async cancelSale(tenantId, saleId, userId, cancellationReason) {
    const sale = await Sale.findOne({ _id: saleId, tenantId });

    if (!sale) {
      throw new NotFoundError('Sale not found');
    }

    if (sale.status === SALE_STATUS.CANCELLED) {
      throw new AppError('Sale is already cancelled', 400);
    }

    if (sale.status === SALE_STATUS.PAID) {
      throw new AppError('Cannot cancel a paid sale', 400);
    }

    sale.status = SALE_STATUS.CANCELLED;
    sale.cancelledAt = new Date();
    sale.cancelledBy = userId;
    sale.cancellationReason = cancellationReason;

    await sale.save();

    return sale;
  }

  async getSalesToday(tenantId, branchId = null) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const query = {
      tenantId,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
      status: { $ne: SALE_STATUS.CANCELLED },
    };

    if (branchId) {
      query.branchId = branchId;
    }

    const sales = await Sale.find(query).populate('branchId', 'name code');

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

    return {
      sales,
      summary: {
        totalSales,
        totalRevenue,
        date: startOfDay,
      },
    };
  }
}

export default new SaleService();
