import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import { z } from 'zod';

export const registerStockMovementSchema = z.object({
  id: z.uuid('Invalid auto part ID'),
  quantity: z.coerce.number().int().positive('Quantity must be positive'),
  type: z.enum(StockMovementType, {
    message: 'Type must be IN or OUT',
  }),
});

export type RegisterStockMovementHttpInput = z.infer<
  typeof registerStockMovementSchema
>;
