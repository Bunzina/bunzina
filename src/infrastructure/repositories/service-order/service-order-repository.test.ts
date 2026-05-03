import { makeServiceOrder } from '@/test/factories/make-service-order';
import { SQL } from 'bun';
import { mockFn } from 'bun-mock-extended';
import { describe, expect, test, type Mock } from 'bun:test';
import { ServiceOrderRepository } from './service-order-repository';

describe('service order repository', () => {
  test('should create a service order and return it', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const mockTransaction =
      mockFn<
        (callback: (sql: typeof mockClient) => Promise<void>) => Promise<void>
      >();

    (
      mockClient as unknown as { transaction: typeof mockTransaction }
    ).transaction = mockTransaction;

    mockTransaction.mockImplementation(async (callback) => {
      await callback(mockClient);
    });

    const repository = new ServiceOrderRepository(mockClient as unknown as SQL);
    const serviceOrder = makeServiceOrder();

    const result = await repository.create(serviceOrder);

    expect(result).toEqual(serviceOrder);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockClient).toHaveBeenCalled();
  });
});
