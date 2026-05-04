import { z } from 'zod';

export const deleteServiceOrderSchema = z.object({
  id: z.uuid('Service order ID must be a valid UUID'),
});

export type DeleteServiceOrderInput = z.infer<typeof deleteServiceOrderSchema>;
