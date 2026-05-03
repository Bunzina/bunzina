import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { describe, expect, test } from 'bun:test';
import { StockMovementsListPresenter } from './stock-movements-list-presenter';

describe('stock movements list presenter', () => {
  test('should convert stock movements list to http format', () => {
    const movementA = makeStockMovement({
      id: '550e8400-e29b-41d4-a716-446655440010',
    });
    const movementB = makeStockMovement({
      id: '550e8400-e29b-41d4-a716-446655440011',
    });

    const result = StockMovementsListPresenter.toHttp(
      [movementA, movementB],
      1,
      20,
    );

    expect(result).toEqual({
      data: [
        expect.objectContaining({
          id: '550e8400-e29b-41d4-a716-446655440010',
        }),
        expect.objectContaining({
          id: '550e8400-e29b-41d4-a716-446655440011',
        }),
      ],
      pagination: {
        page: 1,
        limit: 20,
      },
    });
  });
});
