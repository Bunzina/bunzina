import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { z } from 'zod';

export const listServiceOrdersSchema = z
  .object({
    page: z.coerce.number().int().min(1),
    limit: z.coerce.number().int().min(1).max(100),
    customerId: z.uuid('Customer ID must be a valid UUID').optional(),
    vehicleId: z.uuid('Vehicle ID must be a valid UUID').optional(),
    status: z.enum(ServiceOrderStatus).optional(),
    startCreatedAt: z.iso
      .datetime()
      .optional()
      .transform((value) => (value ? new Date(value) : undefined)),
    endCreatedAt: z.iso
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
