import { z } from 'zod';

export const salesReportSchema = z.object({
  query: z.object({
    startDate: z.string().min(1, 'La fecha de inicio es requerida'),
    endDate: z.string().min(1, 'La fecha de fin es requerida'),
    branchId: z.string().optional(),
  }),
});

export const topProductsSchema = z.object({
  query: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    branchId: z.string().optional(),
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
  }),
});
