import { z } from 'zod';

export const findAutoPartSchema = z.object({
  id: z.uuid('Auto part ID must be a valid UUID'),
});

export type FindAutoPartByIdInput = z.infer<typeof findAutoPartSchema>;
