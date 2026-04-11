import { z } from 'zod';

export const createVehicleSchema = z.object({
  customerId: z.string().uuid('Customer ID must be a valid UUID'),
  licensePlate: z
    .string()
    .min(1, 'License plate is required')
    .regex(
      /^[A-Z]{3}[0-9][A-Z][0-9]{2}$|^[A-Z]{3}-[0-9]{4}$/,
      'Invalid license plate format (use ABC1D23 or ABC-1234)',
    ),
  model: z.string().min(1, 'Model is required'),
  brand: z.string().min(1, 'Brand is required'),
  year: z.number().int().min(1900, 'Year must be valid'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
