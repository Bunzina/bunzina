import { z } from 'zod';
import { licensePlateValidation } from '@/utils/validation-helpers/license-plate';

export const createVehicleSchema = z.object({
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  licensePlate: z
    .string()
    .min(1, 'License plate is required')
    .pipe(licensePlateValidation),
  model: z.string().min(1, 'Model is required'),
  brand: z.string().min(1, 'Brand is required'),
  year: z.number().int().min(1900, 'Year must be valid'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
