import type { StockMovementResponse } from './stock-movement-response';

export interface StockMovementsListResponse {
  data: StockMovementResponse[];
  pagination: {
    page: number;
    limit: number;
  };
}
