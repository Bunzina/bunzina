import { z } from 'zod';
import { licensePlateValidation } from '@/utils/validation-helpers/license-plate';

export const listVehicleSchema = z
  .object({
    page: z.coerce.number().int().min(1),
    limit: z.coerce.number().int().min(1).max(100),
    customerId: z.string().uuid('Customer ID must be a valid UUID').optional(),
    licensePlate: z.string().pipe(licensePlateValidation).optional(),
    model: z.string().optional(),
    brand: z.string().optional(),
    year: z.coerce.number().int().min(1900, 'Year must be valid').optional(),
    startCreatedAt: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    endCreatedAt: z
      .string()
      .datetime()
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
  })
  .transform((data) => ({
    page: data.page,
    limit: data.limit,
    filters: {
      customerId: data.customerId,
      licensePlate: data.licensePlate,
      model: data.model,
      brand: data.brand,
      year: data.year,
      startCreatedAt: data.startCreatedAt,
      endCreatedAt: data.endCreatedAt,
    },
  }));

export type ListVehiclesInput = z.infer<typeof listVehicleSchema>;
