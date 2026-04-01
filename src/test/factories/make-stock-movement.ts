import { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';

export const makeStockMovement = (
  override?: Partial<StockMovement>,
): StockMovement => {
  return new StockMovement({
    autoPartId: 'auto-part-id',
    quantity: 10,
    type: StockMovementType.IN,
    serviceOrderId: 'service-order-id',
    ...override,
  });
};
