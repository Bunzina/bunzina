import { z } from 'zod';

export const deleteUserSchema = z.object({
  id: z.uuid('Invalid user ID'),
});

export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
