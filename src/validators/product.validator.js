import { z } from 'zod';

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1, 'El SKU es requerido').max(50),
    name: z.string().min(1, 'El nombre del producto es requerido').max(200),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number().min(0, 'El precio no puede ser negativo'),
    cost: z.number().min(0, 'El costo no puede ser negativo').optional(),
    taxRate: z.number().min(0).max(100).optional(),
    barcode: z.string().optional(),
    image: z.string().url().optional().or(z.literal('')),
    attributes: z.record(z.any()).optional(),
    trackInventory: z.boolean().optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    sku: z.string().min(1).max(50).optional(),
    name: z.string().min(1).max(200).optional(),
    description: z.string().optional(),
    category: z.string().optional(),
    price: z.number().min(0).optional(),
    cost: z.number().min(0).optional(),
    taxRate: z.number().min(0).max(100).optional(),
    barcode: z.string().optional(),
    image: z.string().url().optional().or(z.literal('')),
    attributes: z.record(z.any()).optional(),
    isActive: z.boolean().optional(),
    trackInventory: z.boolean().optional(),
  }),
});

export const queryProductSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    category: z.string().optional(),
    isActive: z.string().optional(),
    page: z.string().regex(/^\d+$/).transform(Number).optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    sort: z.string().optional(),
  }),
});
