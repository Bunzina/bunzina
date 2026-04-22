import { z } from 'zod';

export const listAutoPartSchema = z
  .object({
    page: z.coerce.number().int().min(1),
    limit: z.coerce.number().int().min(1).max(100),
    name: z.string().optional(),
    lowStock: z.coerce.boolean().optional(),
  })
  .transform((data) => ({
    page: data.page,
    limit: data.limit,
    filters: {
      name: data.name,
      lowStock: data.lowStock,
    },
  }));

export type ListAutoPartsInput = z.infer<typeof listAutoPartSchema>;
