import z from 'zod';

export const deleteServiceSchema = z.object({
  id: z.uuid('Service ID must be a valid UUID'),
});

export type DeleteServiceHttpInput = z.infer<typeof deleteServiceSchema>;
