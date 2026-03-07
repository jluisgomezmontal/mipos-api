import { z } from 'zod';

export const openCashRegisterSchema = z.object({
  body: z.object({
    branchId: z.string().min(1, 'Branch ID is required'),
    initialCash: z.number().min(0, 'Initial cash must be a positive number'),
  }),
});

export const addWithdrawalSchema = z.object({
  body: z.object({
    amount: z.number().min(0.01, 'Withdrawal amount must be greater than 0'),
    reason: z.string().min(1, 'Reason is required').max(200, 'Reason is too long'),
  }),
});

export const closeCashRegisterSchema = z.object({
  body: z.object({
    cashRegisterId: z.string().min(1, 'Cash register ID is required'),
    finalCash: z.number().min(0, 'Final cash must be a positive number'),
    notes: z.string().max(500, 'Notes are too long').optional(),
  }),
});
