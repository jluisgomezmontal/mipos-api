import { z } from 'zod';

export const createBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre de la sucursal es requerido').max(100),
    code: z.string().min(1, 'El código de la sucursal es requerido').max(20),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
      })
      .optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    manager: z.string().optional(),
  }),
});

export const updateBranchSchema = z.object({
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    code: z.string().min(1).max(20).optional(),
    address: z
      .object({
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        zipCode: z.string().optional(),
      })
      .optional(),
    phone: z.string().optional(),
    email: z.string().email().optional(),
    manager: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});
