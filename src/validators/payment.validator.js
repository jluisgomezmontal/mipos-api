import { z } from 'zod';
import { PAYMENT_METHOD } from '../utils/constants.js';

export const createPaymentSchema = z.object({
  body: z.object({
    saleId: z.string().min(1, 'El ID de la venta es requerido'),
    method: z.enum([PAYMENT_METHOD.CASH, PAYMENT_METHOD.CARD, PAYMENT_METHOD.TRANSFER]),
    amount: z.number().min(0, 'El monto no puede ser negativo'),
    reference: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const queryPaymentSchema = z.object({
  query: z.object({
    saleId: z.string().optional(),
    method: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
});
