import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { describe, expect, test } from 'bun:test';
import { StockMovementPresenter } from './stock-movement-presenter';

describe('stock movement presenter', () => {
  test('should convert stock movement to http format', () => {
    const stockMovement = makeStockMovement({
      id: '550e8400-e29b-41d4-a716-446655440000',
      autoPartId: '550e8400-e29b-41d4-a716-446655440001',
    });

    const result = StockMovementPresenter.toHttp(stockMovement);

    expect(result).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      autoPartId: '550e8400-e29b-41d4-a716-446655440001',
      quantity: stockMovement.quantity,
      type: stockMovement.type,
      serviceOrderId: stockMovement.serviceOrderId,
      createdAt: stockMovement.createdAt,
    });
  });
});
