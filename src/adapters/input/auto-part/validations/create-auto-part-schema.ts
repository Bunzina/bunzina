import { z } from 'zod';

export const createAutoPartSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(255, 'Name must be at most 255 characters'),
  description: z.string().min(1, 'Description is required'),
  price: z
    .number()
    .nonnegative('Price cannot be negative')
    .finite('Price must be a finite number'),
  stock: z
    .number()
    .int('Stock must be an integer')
    .nonnegative('Stock cannot be negative'),
});

export type CreateAutoPartInput = z.infer<typeof createAutoPartSchema>;
