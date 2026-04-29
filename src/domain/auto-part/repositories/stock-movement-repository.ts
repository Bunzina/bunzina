import type { StockMovement } from '../entities/stock-movement';

export interface FindStockMovementsByAutoPartIdParams {
  autoPartId: string;
  page: number;
  limit: number;
}

export interface StockMovementRepository {
  create(stockMovement: StockMovement): Promise<StockMovement>;
  findByAutoPartId(
    params: FindStockMovementsByAutoPartIdParams,
  ): Promise<StockMovement[]>;
}
