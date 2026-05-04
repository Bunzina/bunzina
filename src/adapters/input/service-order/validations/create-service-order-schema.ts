import { z } from 'zod';

const serviceItemSchema = z.object({
  serviceId: z.uuid('Service ID must be a valid UUID'),
  price: z.number().nonnegative('Price cannot be negative'),
  description: z.string().optional(),
});

const autoPartItemSchema = z.object({
  autoPartId: z.uuid('Auto part ID must be a valid UUID'),
  quantity: z
    .number()
    .int('Quantity must be an integer')
    .min(1, 'Quantity must be at least 1'),
  unitPrice: z.number().nonnegative('Unit price cannot be negative'),
  description: z.string().optional(),
});

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
