import { z } from 'zod';

export const findCustomerByIdSchema = z.object({
  id: z.string().uuid('Customer ID must be a valid UUID'),
});

export type FindCustomerByIdInput = z.infer<typeof findCustomerByIdSchema>;
