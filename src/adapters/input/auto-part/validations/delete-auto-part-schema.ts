import { z } from 'zod';

export const deleteAutoPartSchema = z.object({
  id: z.uuid('Auto part ID must be a valid UUID'),
});

export type DeleteAutoPartInput = z.infer<typeof deleteAutoPartSchema>;
