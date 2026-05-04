import { z } from 'zod';

export const updateServiceOrderStatusBodySchema = z.object({
  direction: z.enum(['next', 'back']),
});

export const updateServiceOrderStatusSchema =
  updateServiceOrderStatusBodySchema.extend({
    id: z.uuid('Service order ID must be a valid UUID'),
  });

export type UpdateServiceOrderStatusInput = z.infer<
  typeof updateServiceOrderStatusSchema
>;
