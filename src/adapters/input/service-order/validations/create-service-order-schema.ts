import { z } from 'zod';
import {
  autoPartItemSchema,
  serviceItemSchema,
} from './service-order-item-schemas';

export const createServiceOrderSchema = z
  .object({
    customerId: z.uuid('Customer ID must be a valid UUID'),
    vehicleId: z.uuid('Vehicle ID must be a valid UUID'),
    serviceItems: z.array(serviceItemSchema).optional(),
    autoPartItems: z.array(autoPartItemSchema).optional(),
  })
  .refine(
    (data) =>
      (data.serviceItems?.length ?? 0) + (data.autoPartItems?.length ?? 0) > 0,
    {
      message: 'At least one item is required',
      path: ['serviceItems'],
    },
  );

export type CreateServiceOrderInput = z.infer<typeof createServiceOrderSchema>;
