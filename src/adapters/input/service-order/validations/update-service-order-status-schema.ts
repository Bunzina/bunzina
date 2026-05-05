import { StatusDirection } from '@/domain/service-order/state-machines/status-machine';
import { z } from 'zod';

export const updateServiceOrderStatusBodySchema = z.object({
  direction: z.enum(StatusDirection),
});

export const updateServiceOrderStatusSchema =
  updateServiceOrderStatusBodySchema.extend({
    id: z.uuid('Service order ID must be a valid UUID'),
  });

export type UpdateServiceOrderStatusInput = z.infer<
  typeof updateServiceOrderStatusSchema
>;
