import { z } from 'zod';

export const findUserSchema = z.object({
  id: z.uuid('Invalid user ID'),
});

export type FindUserInput = z.infer<typeof findUserSchema>;
