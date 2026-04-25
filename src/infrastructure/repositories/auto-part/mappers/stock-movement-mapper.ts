import { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type { StockMovementDbSchema } from '../dtos/stock-movement-db-schema';

export const StockMovementMapper = {
  toDatabase(stockMovement: StockMovement): StockMovementDbSchema {
    return {
      id: stockMovement.id!,
      auto_part_id: stockMovement.autoPartId,
      quantity: stockMovement.quantity,
      type: stockMovement.type,
      service_order_id: stockMovement.serviceOrderId,
      created_at: stockMovement.createdAt,
    };
  },

  toDomain(record: StockMovementDbSchema): StockMovement {
    return new StockMovement({
      id: record.id,
      autoPartId: record.auto_part_id,
      quantity: record.quantity,
      type: record.type,
      serviceOrderId: record.service_order_id,
      createdAt: record.created_at,
    });
  },
};
