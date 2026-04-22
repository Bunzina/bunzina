import z from 'zod';

export const findServiceSchema = z.object({
  id: z.uuid('Service ID must be a valid UUID'),
});

export type FindServiceHttpInput = z.infer<typeof findServiceSchema>;
