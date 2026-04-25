import { StockMovementType } from '@/domain/auto-part/types/stock-movement-type';
import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { describe, expect, test } from 'bun:test';
import { StockMovementMapper } from './stock-movement-mapper';

describe('stock movement mapper', () => {
  test('should map domain entity to database schema', () => {
    const stockMovement = makeStockMovement({
      id: '550e8400-e29b-41d4-a716-446655440000',
      autoPartId: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 5,
      type: StockMovementType.OUT,
      serviceOrderId: undefined,
      createdAt: new Date('2026-04-25T00:00:00.000Z'),
    });

    const result = StockMovementMapper.toDatabase(stockMovement);

    expect(result).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      auto_part_id: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 5,
      type: StockMovementType.OUT,
      service_order_id: undefined,
      created_at: new Date('2026-04-25T00:00:00.000Z'),
    });
  });

  test('should map database schema to domain entity', () => {
    const result = StockMovementMapper.toDomain({
      id: '550e8400-e29b-41d4-a716-446655440000',
      auto_part_id: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 5,
      type: StockMovementType.IN,
      service_order_id: '550e8400-e29b-41d4-a716-446655440002',
      created_at: new Date('2026-04-25T00:00:00.000Z'),
    });

    expect(result).toMatchObject({
      id: '550e8400-e29b-41d4-a716-446655440000',
      autoPartId: '550e8400-e29b-41d4-a716-446655440001',
      quantity: 5,
      type: StockMovementType.IN,
      serviceOrderId: '550e8400-e29b-41d4-a716-446655440002',
      createdAt: new Date('2026-04-25T00:00:00.000Z'),
    });
  });
});
