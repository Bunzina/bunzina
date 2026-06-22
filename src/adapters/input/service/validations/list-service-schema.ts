import { z } from 'zod';

export const listServiceSchema = z
  .object({
    page: z.coerce.number().int().min(1),
    limit: z.coerce.number().int().min(1).max(100),
    name: z.string().optional(),
  })
  .transform((data) => ({
    page: data.page,
    limit: data.limit,
    filters: {
      name: data.name,
    },
  }));

export type ListServicesHttpInput = z.infer<typeof listServiceSchema>;
