import { z } from 'zod';

export const serviceItemSchema = z.object({
  serviceId: z.uuid('Service ID must be a valid UUID'),
  price: z.number().nonnegative('Price cannot be negative'),
  description: z.string().optional(),
  isCompleted: z.boolean().optional(),
});

export const autoPartItemSchema = z.object({
  autoPartId: z.uuid('Auto part ID must be a valid UUID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  description: z.string().optional(),
});
