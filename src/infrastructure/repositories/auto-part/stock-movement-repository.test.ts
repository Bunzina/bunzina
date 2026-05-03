import { makeStockMovement } from '@/test/factories/make-stock-movement';
import { SQL } from 'bun';
import { mockFn } from 'bun-mock-extended';
import { describe, expect, test, type Mock } from 'bun:test';
import { StockMovementRepository } from './stock-movement-repository';

describe('stock movement repository', () => {
  test('should create a stock movement and return it', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new StockMovementRepository(
      mockClient as unknown as SQL,
    );
    const stockMovement = makeStockMovement();

    const result = await repository.create(stockMovement);

    expect(result).toEqual(stockMovement);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should list stock movements by auto part id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        auto_part_id: '550e8400-e29b-41d4-a716-446655440001',
        quantity: 5,
        type: 'IN',
        service_order_id: undefined,
        created_at: new Date(),
      },
    ]);

    const repository = new StockMovementRepository(
      mockClient as unknown as SQL,
    );

    const result = await repository.findByAutoPartId({
      autoPartId: '550e8400-e29b-41d4-a716-446655440001',
      page: 1,
      limit: 20,
    });

    expect(result).toHaveLength(1);
    expect(result[0]?.autoPartId).toBe('550e8400-e29b-41d4-a716-446655440001');
    expect(mockClient).toHaveBeenCalled();
  });
});
