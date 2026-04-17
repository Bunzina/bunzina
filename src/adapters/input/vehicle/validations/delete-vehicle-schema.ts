import { z } from 'zod';

export const deleteVehicleSchema = z.object({
  id: z.string().uuid('Vehicle ID must be a valid UUID'),
});

export type DeleteVehicleInput = z.infer<typeof deleteVehicleSchema>;
