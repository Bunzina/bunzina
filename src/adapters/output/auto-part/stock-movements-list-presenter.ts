import type { StockMovement } from '@/domain/auto-part/entities/stock-movement';
import type { StockMovementsListResponse } from './dtos/stock-movements-list-response';
import { StockMovementPresenter } from './stock-movement-presenter';

export const StockMovementsListPresenter = {
  toHttp(
    stockMovements: StockMovement[],
    page: number,
    limit: number,
  ): StockMovementsListResponse {
    return {
      data: stockMovements.map((stockMovement) =>
        StockMovementPresenter.toHttp(stockMovement),
      ),
      pagination: {
        page,
        limit,
      },
    };
  },
};
