import z from 'zod';

export const createServiceSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  durationInMinutes: z.number().positive('Duration must be a positive number'),
});

export type CreateServiceHttpInput = z.infer<typeof createServiceSchema>;
