import { z } from 'zod';

export const findVehicleSchema = z.object({
  id: z.string().uuid('Vehicle ID must be a valid UUID'),
});

export type FindVehicleByIdInput = z.infer<typeof findVehicleSchema>;
