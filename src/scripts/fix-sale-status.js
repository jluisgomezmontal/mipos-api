import mongoose from 'mongoose';
import Sale from '../models/Sale.js';
import Payment from '../models/Payment.js';
import { SALE_STATUS, PAYMENT_STATUS } from '../utils/constants.js';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Script para actualizar el estado de las ventas que tienen pagos completados
 * pero siguen marcadas como PENDING
 */
async function fixSaleStatus() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Conectado a MongoDB');

    // Buscar todas las ventas en estado PENDING
    const pendingSales = await Sale.find({ status: SALE_STATUS.PENDING });
    console.log(`📊 Encontradas ${pendingSales.length} ventas en estado PENDING`);

    let updatedCount = 0;

    for (const sale of pendingSales) {
      // Buscar pagos completados para esta venta
      const payments = await Payment.find({
        saleId: sale._id,
        status: PAYMENT_STATUS.COMPLETED,
      });

      if (payments.length > 0) {
        // Calcular el total pagado
        const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

        // Si el total pagado es mayor o igual al total de la venta, marcarla como PAID
        // Usamos una tolerancia de 0.01 para evitar problemas de redondeo
        if (totalPaid >= sale.total - 0.01) {
          sale.status = SALE_STATUS.PAID;
          await sale.save();
          updatedCount++;
          console.log(`✅ Venta ${sale.saleNumber} actualizada a PAID (Total: $${sale.total.toFixed(2)}, Pagado: $${totalPaid.toFixed(2)})`);
        } else {
          const difference = sale.total - totalPaid;
          console.log(`⚠️  Venta ${sale.saleNumber} tiene pagos parciales (Total: $${sale.total.toFixed(2)}, Pagado: $${totalPaid.toFixed(2)}, Falta: $${difference.toFixed(2)})`);
        }
      }
    }

    console.log(`\n🎉 Proceso completado:`);
    console.log(`   - Ventas revisadas: ${pendingSales.length}`);
    console.log(`   - Ventas actualizadas: ${updatedCount}`);
    console.log(`   - Ventas sin cambios: ${pendingSales.length - updatedCount}`);

    await mongoose.disconnect();
    console.log('✅ Desconectado de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixSaleStatus();
