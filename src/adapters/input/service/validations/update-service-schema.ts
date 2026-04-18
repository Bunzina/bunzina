import z from 'zod';

export const updateServiceSchema = z.object({
  id: z.uuid('Service ID must be a valid UUID'),
  name: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  durationInMinutes: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export type UpdateServiceHttpInput = z.infer<typeof updateServiceSchema>;
