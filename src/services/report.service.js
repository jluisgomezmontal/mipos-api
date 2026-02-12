import Sale from '../models/Sale.js';
import Payment from '../models/Payment.js';
import { SALE_STATUS, PAYMENT_STATUS } from '../utils/constants.js';

class ReportService {
  async getSalesReport(tenantId, startDate, endDate, branchId = null) {
    const query = {
      tenantId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: { $ne: SALE_STATUS.CANCELLED },
    };

    if (branchId) {
      query.branchId = branchId;
    }

    const sales = await Sale.find(query).populate('branchId', 'name code');

    const totalSales = sales.length;
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const totalDiscount = sales.reduce((sum, sale) => sum + sale.discount, 0);
    const totalTax = sales.reduce((sum, sale) => sum + sale.taxAmount, 0);
    const averageSaleValue = totalSales > 0 ? totalRevenue / totalSales : 0;

    const salesByStatus = sales.reduce((acc, sale) => {
      acc[sale.status] = (acc[sale.status] || 0) + 1;
      return acc;
    }, {});

    const salesByBranch = sales.reduce((acc, sale) => {
      const branchName = sale.branchId?.name || 'Unknown';
      if (!acc[branchName]) {
        acc[branchName] = {
          count: 0,
          revenue: 0,
        };
      }
      acc[branchName].count += 1;
      acc[branchName].revenue += sale.total;
      return acc;
    }, {});

    const dailySalesMap = sales.reduce((acc, sale) => {
      const date = sale.createdAt.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = {
          date,
          totalSales: 0,
          totalRevenue: 0,
        };
      }
      acc[date].totalSales += 1;
      acc[date].totalRevenue += sale.total;
      return acc;
    }, {});

    // Convertir el objeto a array y calcular ticket promedio
    const dailySales = Object.values(dailySalesMap).map(day => ({
      ...day,
      averageTicket: day.totalSales > 0 ? day.totalRevenue / day.totalSales : 0,
    })).sort((a, b) => new Date(a.date) - new Date(b.date));

    return {
      sales: dailySales,
      summary: {
        totalSales,
        totalRevenue,
        averageTicket: averageSaleValue,
        startDate,
        endDate,
      },
    };
  }

  async getTopProducts(tenantId, startDate = null, endDate = null, branchId = null, limit = 10) {
    const query = {
      tenantId,
      status: { $ne: SALE_STATUS.CANCELLED },
    };

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    if (branchId) {
      query.branchId = branchId;
    }

    const sales = await Sale.find(query);

    const productStats = {};

    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const productId = item.productId.toString();
        if (!productStats[productId]) {
          productStats[productId] = {
            productId,
            sku: item.productSnapshot.sku,
            name: item.productSnapshot.name,
            quantitySold: 0,
            totalRevenue: 0,
            totalCost: 0,
            totalProfit: 0,
          };
        }

        productStats[productId].quantitySold += item.quantity;
        productStats[productId].totalRevenue += item.total;
        productStats[productId].totalCost += item.productSnapshot.cost * item.quantity;
        productStats[productId].totalProfit +=
          item.total - item.productSnapshot.cost * item.quantity;
      });
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.quantitySold - a.quantitySold)
      .slice(0, limit);

    const totalQuantitySold = topProducts.reduce((sum, p) => sum + p.quantitySold, 0);
    const totalRevenue = topProducts.reduce((sum, p) => sum + p.totalRevenue, 0);

    return {
      products: topProducts.map(p => ({
        productId: p.productId,
        productName: p.name,
        sku: p.sku,
        quantitySold: p.quantitySold,
        totalRevenue: p.totalRevenue,
        profit: p.totalProfit,
      })),
      summary: {
        totalProducts: topProducts.length,
        totalQuantitySold,
        totalRevenue,
      },
    };
  }

  async getRevenueByBranch(tenantId, startDate, endDate) {
    const query = {
      tenantId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: { $ne: SALE_STATUS.CANCELLED },
    };

    const sales = await Sale.find(query).populate('branchId', 'name code');

    const revenueByBranch = sales.reduce((acc, sale) => {
      const branchId = sale.branchId?._id.toString() || 'unknown';
      const branchName = sale.branchId?.name || 'Unknown';
      const branchCode = sale.branchId?.code || 'N/A';

      if (!acc[branchId]) {
        acc[branchId] = {
          branchId,
          branchName,
          branchCode,
          totalSales: 0,
          totalRevenue: 0,
          totalDiscount: 0,
          totalTax: 0,
        };
      }

      acc[branchId].totalSales += 1;
      acc[branchId].totalRevenue += sale.total;
      acc[branchId].totalDiscount += sale.discount;
      acc[branchId].totalTax += sale.taxAmount;

      return acc;
    }, {});

    const branches = Object.values(revenueByBranch).map(branch => ({
      ...branch,
      averageTicket: branch.totalSales > 0 ? branch.totalRevenue / branch.totalSales : 0,
    })).sort((a, b) => b.totalRevenue - a.totalRevenue);

    const totalSales = branches.reduce((sum, b) => sum + b.totalSales, 0);
    const totalRevenue = branches.reduce((sum, b) => sum + b.totalRevenue, 0);

    return {
      branches,
      summary: {
        totalBranches: branches.length,
        totalSales,
        totalRevenue,
      },
    };
  }

  async getPaymentMethodsReport(tenantId, startDate, endDate, branchId = null) {
    const query = {
      tenantId,
      createdAt: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
      status: PAYMENT_STATUS.COMPLETED,
    };

    const payments = await Payment.find(query).populate({
      path: 'saleId',
      select: 'branchId',
    });

    let filteredPayments = payments;
    if (branchId) {
      filteredPayments = payments.filter(
        (payment) => payment.saleId?.branchId?.toString() === branchId
      );
    }

    const paymentsByMethod = filteredPayments.reduce((acc, payment) => {
      const method = payment.method;
      if (!acc[method]) {
        acc[method] = {
          method,
          count: 0,
          totalAmount: 0,
        };
      }

      acc[method].count += 1;
      acc[method].totalAmount += payment.amount;

      return acc;
    }, {});

    return Object.values(paymentsByMethod).sort((a, b) => b.totalAmount - a.totalAmount);
  }

  async getDashboardStats(tenantId, branchId = null) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const todayQuery = {
      tenantId,
      createdAt: { $gte: today, $lte: endOfToday },
      status: { $ne: SALE_STATUS.CANCELLED },
    };

    const monthQuery = {
      tenantId,
      createdAt: { $gte: startOfMonth, $lte: endOfToday },
      status: { $ne: SALE_STATUS.CANCELLED },
    };

    if (branchId) {
      todayQuery.branchId = branchId;
      monthQuery.branchId = branchId;
    }

    const todaySales = await Sale.find(todayQuery);
    const monthSales = await Sale.find(monthQuery);

    const todayRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const monthRevenue = monthSales.reduce((sum, sale) => sum + sale.total, 0);

    const todayPayments = await Payment.find({
      tenantId,
      createdAt: { $gte: today, $lte: endOfToday },
      status: PAYMENT_STATUS.COMPLETED,
    });

    const todayPaymentsTotal = todayPayments.reduce((sum, payment) => sum + payment.amount, 0);

    return {
      today: {
        sales: todaySales.length,
        revenue: todayRevenue,
        paymentsReceived: todayPaymentsTotal,
      },
      thisMonth: {
        sales: monthSales.length,
        revenue: monthRevenue,
      },
    };
  }
}

export default new ReportService();
