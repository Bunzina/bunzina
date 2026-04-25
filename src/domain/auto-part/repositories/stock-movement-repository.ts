import type { StockMovement } from '../entities/stock-movement';

export interface StockMovementRepository {
  create(stockMovement: StockMovement): Promise<StockMovement>;
}
