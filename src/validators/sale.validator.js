import { z } from 'zod';
import { SALE_STATUS } from '../utils/constants.js';

const saleItemSchema = z.object({
  productId: z.string().min(1, 'El ID del producto es requerido'),
  quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
  unitPrice: z.number().min(0, 'El precio unitario no puede ser negativo'),
  discount: z.number().min(0, 'El descuento no puede ser negativo').optional(),
});

export const createSaleSchema = z.object({
  body: z.object({
    branchId: z.string().min(1, 'El ID de la sucursal es requerido'),
    items: z.array(saleItemSchema).min(1, 'Se requiere al menos un producto'),
    discount: z.number().min(0, 'El descuento no puede ser negativo').optional(),
    customerId: z.string().optional(),
    customerInfo: z
      .object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
      })
      .optional(),
    notes: z.string().optional(),
  }),
});

export const updateSaleStatusSchema = z.object({
  body: z.object({
    status: z.enum([SALE_STATUS.CANCELLED]),
    cancellationReason: z.string().min(1, 'La razón de cancelación es requerida'),
  }),
});

export const querySaleSchema = z.object({
  query: z.object({
    branchId: z.string().optional(),
    status: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
