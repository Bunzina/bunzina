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
});
