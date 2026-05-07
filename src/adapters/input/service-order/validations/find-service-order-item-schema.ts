import { z } from 'zod';

export const findServiceOrderItemSchema = z.object({
  id: z.uuid('Service item ID must be a valid UUID'),
});

export type FindServiceOrderItemInput = z.infer<
  typeof findServiceOrderItemSchema
>;
