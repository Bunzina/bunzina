import { z } from 'zod';

export const findServiceOrderSchema = z.object({
  id: z.uuid('Service order ID must be a valid UUID'),
});

export type FindServiceOrderByIdInput = z.infer<typeof findServiceOrderSchema>;
