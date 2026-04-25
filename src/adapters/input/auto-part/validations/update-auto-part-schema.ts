import { z } from 'zod';

export const updateAutoPartSchema = z.object({
  id: z.uuid('Invalid auto part ID'),
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be positive'),
  stock: z.coerce.number().int().min(0, 'Stock must be a non-negative integer'),
});

export type UpdateAutoPartHttpInput = z.infer<typeof updateAutoPartSchema>;
