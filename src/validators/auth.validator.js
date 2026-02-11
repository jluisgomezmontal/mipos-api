import { z } from 'zod';
import { USER_ROLES } from '../utils/constants.js';

export const registerTenantSchema = z.object({
  body: z.object({
    tenant: z.object({
      name: z.string().min(1, 'El nombre del negocio es requerido').max(100),
      businessName: z.string().min(1, 'La razón social es requerida'),
      email: z.string().email('Formato de correo electrónico inválido'),
      phone: z.string().optional(),
      taxId: z.string().optional(),
    }),
    owner: z.object({
      email: z.string().email('Formato de correo electrónico inválido'),
      password: z
        .string()
        .min(8, 'La contraseña debe tener al menos 8 caracteres')
        .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
        .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
        .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
      firstName: z.string().min(1, 'El nombre es requerido'),
      lastName: z.string().min(1, 'El apellido es requerido'),
    }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Formato de correo electrónico inválido'),
    password: z.string().min(1, 'La contraseña es requerida'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'El refresh token es requerido'),
  }),
});

export const createUserSchema = z.object({
  body: z.object({
    email: z.string().email('Formato de correo electrónico inválido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres')
      .regex(/[A-Z]/, 'La contraseña debe contener al menos una letra mayúscula')
      .regex(/[a-z]/, 'La contraseña debe contener al menos una letra minúscula')
      .regex(/[0-9]/, 'La contraseña debe contener al menos un número'),
    firstName: z.string().min(1, 'El nombre es requerido'),
    lastName: z.string().min(1, 'El apellido es requerido'),
    role: z.enum([USER_ROLES.ADMIN, USER_ROLES.CASHIER]),
  }),
});

export const updateTenantSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'El nombre del negocio es requerido').max(100).optional(),
    businessName: z.string().min(1, 'La razón social es requerida').optional(),
    email: z.string().email('Formato de correo electrónico inválido').optional(),
    phone: z.string().optional(),
    taxId: z.string().optional(),
    address: z.object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      zipCode: z.string().optional(),
    }).optional(),
  }),
});

export const updateTenantSettingsSchema = z.object({
  body: z.object({
    currency: z.string().min(1, 'La moneda es requerida').optional(),
    timezone: z.string().min(1, 'La zona horaria es requerida').optional(),
    taxRate: z.number().min(0, 'La tasa de impuesto no puede ser negativa').max(100, 'La tasa de impuesto no puede exceder 100%').optional(),
  }),
});
