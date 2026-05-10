import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { z } from 'zod';

export const listServiceOrdersSchema = z
  .object({
    page: z.coerce.number().int().min(1),
    limit: z.coerce.number().int().min(1).max(100),
    customerId: z
      .string()
      .uuid('Customer ID must be a valid UUID')
      .optional(),
    vehicleId: z.string().uuid('Vehicle ID must be a valid UUID').optional(),
    status: z.nativeEnum(ServiceOrderStatus).optional(),
    startCreatedAt: z
      .string()
      .datetime()
      .optional()
      .transform((value) => (value ? new Date(value) : undefined)),
    endCreatedAt: z
      .string()
      .datetime()
      .optional()
      .transform((value) => (value ? new Date(value) : undefined)),
  })
  .transform((data) => ({
    page: data.page,
    limit: data.limit,
    filters: {
      customerId: data.customerId,
      vehicleId: data.vehicleId,
      status: data.status,
      startCreatedAt: data.startCreatedAt,
      endCreatedAt: data.endCreatedAt,
    },
  }));

export type ListServiceOrdersInput = z.infer<typeof listServiceOrdersSchema>;