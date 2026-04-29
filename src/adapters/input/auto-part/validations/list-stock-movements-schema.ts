import { z } from 'zod';

export const listStockMovementsSchema = z
  .object({
    id: z.uuid('Invalid auto part ID'),
    page: z.coerce.number().int().min(1),
    limit: z.coerce.number().int().min(1).max(100),
  })
  .transform((data) => ({
    id: data.id,
    page: data.page,
    limit: data.limit,
  }));

export type ListStockMovementsInput = z.infer<typeof listStockMovementsSchema>;
