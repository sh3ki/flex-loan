import { z } from 'zod';

export const creditorSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  contactNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  notes: z.string().optional(),
});

export const loanSchema = z.object({
  creditorId: z.string().min(1, 'Borrower is required'),
  principal: z.number().min(0.01, 'Principal must be greater than 0').positive('Principal must be a positive number'),
  interestPerDay: z.number().min(0.01, 'Interest rate must be greater than 0').positive('Interest must be a positive number'),
  termDays: z.number().int('Term must be a whole number').min(1, 'Term must be at least 1 day').positive('Term must be a positive number'),
  releaseDate: z.string().min(1, 'Release date is required'),
});

export const paymentSchema = z.object({
  loanId: z.string().min(1, 'Loan is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0').positive('Amount must be a positive number'),
  paymentDate: z.string().min(1, 'Payment date is required'),
  paymentMethod: z.enum(['Cash', 'GCash', 'Bank Transfer', 'Check']),
  referenceNumber: z.string().optional(),
  notes: z.string().optional(),
});

export type CreditorFormData = z.infer<typeof creditorSchema>;
export type LoanFormData = z.infer<typeof loanSchema>;
export type PaymentFormData = z.infer<typeof paymentSchema>;
