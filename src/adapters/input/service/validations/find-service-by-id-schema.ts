import z from 'zod';

export const findServiceByIdSchema = z.object({
  id: z.uuid('Service ID must be a valid UUID'),
});

export type FindServiceByIdHttpInput = z.infer<typeof findServiceByIdSchema>;
