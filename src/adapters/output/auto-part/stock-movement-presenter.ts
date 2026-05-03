import type { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type { StockMovementResponse } from './dtos/stock-movement-response';

export const StockMovementPresenter = {
  toHttp(stockMovement: StockMovement): StockMovementResponse {
    return {
      id: stockMovement.id!,
      autoPartId: stockMovement.autoPartId,
      quantity: stockMovement.quantity,
      type: stockMovement.type,
      serviceOrderId: stockMovement.serviceOrderId,
      createdAt: stockMovement.createdAt,
    };
  },
};
