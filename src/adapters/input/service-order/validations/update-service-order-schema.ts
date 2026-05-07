import { z } from 'zod';
import {
  autoPartItemSchema,
  serviceItemSchema,
} from './service-order-item-schema';

const updateServiceOrderBaseSchema = z.object({
  serviceItems: z.array(serviceItemSchema).optional(),
  autoPartItems: z.array(autoPartItemSchema).optional(),
});

const hasAtLeastOneItem = (data: {
  serviceItems?: unknown[];
  autoPartItems?: unknown[];
}) => (data.serviceItems?.length ?? 0) + (data.autoPartItems?.length ?? 0) > 0;

export const updateServiceOrderBodySchema = updateServiceOrderBaseSchema.refine(
  hasAtLeastOneItem,
  {
    message: 'At least one item is required',
    path: ['serviceItems'],
  },
);

export const updateServiceOrderSchema = updateServiceOrderBaseSchema
  .extend({
    id: z.uuid('Service order ID must be a valid UUID'),
  })
  .refine(hasAtLeastOneItem, {
    message: 'At least one item is required',
    path: ['serviceItems'],
  });

export type UpdateServiceOrderInput = z.infer<typeof updateServiceOrderSchema>;
