import { z } from 'zod';
import { INVENTORY_MOVEMENT_TYPE } from '../utils/constants.js';

export const createInventoryMovementSchema = z.object({
  body: z.object({
    productId: z.string().min(1, 'El ID del producto es requerido'),
    branchId: z.string().min(1, 'El ID de la sucursal es requerido'),
    type: z.enum([
      INVENTORY_MOVEMENT_TYPE.IN,
      INVENTORY_MOVEMENT_TYPE.OUT,
      INVENTORY_MOVEMENT_TYPE.ADJUSTMENT,
    ]),
    quantity: z.number().int().min(1, 'La cantidad debe ser al menos 1'),
    reason: z.string().optional(),
    reference: z.string().optional(),
  }),
});

export const updateInventorySchema = z.object({
  body: z.object({
    minStock: z.number().min(0).optional(),
    maxStock: z.number().min(0).optional(),
  }),
});

export const queryInventorySchema = z.object({
  query: z.object({
    branchId: z.string().optional(),
    productId: z.string().optional(),
    lowStock: z.string().optional(),
  }),
});
