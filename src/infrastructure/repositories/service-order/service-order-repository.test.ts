import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { SQL } from 'bun';
import { mockFn } from 'bun-mock-extended';
import { describe, expect, test, type Mock } from 'bun:test';
import { ServiceOrderRepository } from './service-order-repository';

type SqlQueryMock = Mock<(..._args: unknown[]) => Promise<unknown[]>>;
type TransactionMock = Mock<
  (callback: (sql: SqlQueryMock) => Promise<void>) => Promise<void>
>;

describe('service order repository', () => {
  test('should create a service order and return it', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as SqlQueryMock;
    mockClient.mockResolvedValue([]);

    const mockTransaction = mockFn<
      (callback: (sql: SqlQueryMock) => Promise<void>) => Promise<void>
    >() as unknown as TransactionMock;

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

  test('should update a service order and return it', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as SqlQueryMock;
    mockClient.mockResolvedValue([]);

    const mockTransaction = mockFn<
      (callback: (sql: SqlQueryMock) => Promise<void>) => Promise<void>
    >() as unknown as TransactionMock;

    (
      mockClient as unknown as { transaction: typeof mockTransaction }
    ).transaction = mockTransaction;

    mockTransaction.mockImplementation(async (callback) => {
      await callback(mockClient);
    });

    const repository = new ServiceOrderRepository(mockClient as unknown as SQL);
    const serviceOrder = makeServiceOrder({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });

    const result = await repository.update(serviceOrder);

    expect(result).toEqual(serviceOrder);
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find a service order by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as SqlQueryMock;

    const serviceOrderId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    mockClient
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: serviceOrderId,
            customer_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            vehicle_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            status: ServiceOrderStatus.RECEIVED,
            quote_services_total: 120,
            quote_auto_parts_total: 80,
            quote_total: 200,
            created_at: createdAt,
            updated_at: updatedAt,
            approved_at: null,
            started_at: null,
            completed_at: null,
            delivered_at: null,
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'service-item-1',
            service_order_id: serviceOrderId,
            service_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
            description: 'Brake check',
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'auto-part-item-1',
            service_order_id: serviceOrderId,
            auto_part_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            quantity: 2,
            unit_price: 40,
            total_price: 80,
            description: 'Brake pad',
          },
        ] as unknown[]),
      );

    const repository = new ServiceOrderRepository(mockClient as unknown as SQL);

    const result = await repository.findById(serviceOrderId);
    const expected = {
      id: serviceOrderId,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        {
          id: 'service-item-1',
          serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          price: {
            value: 120,
          },
          description: 'Brake check',
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: 'auto-part-item-1',
          autoPartId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          quantity: 2,
          unitPrice: {
            value: 40,
          },
          totalPrice: {
            value: 80,
          },
          description: 'Brake pad',
        },
      ],
      quote: {
        servicesTotal: 120,
        autoPartsTotal: 80,
        total: 200,
      },
      createdAt,
      updatedAt,
    } as unknown as typeof result;

    expect(result).not.toBeNull();
    expect(result).toEqual(expected);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should return null when service order is not found', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as SqlQueryMock;
    mockClient.mockResolvedValue([]);

    const repository = new ServiceOrderRepository(mockClient as unknown as SQL);

    const result = await repository.findById(
      'ffffffff-ffff-4fff-8fff-ffffffffffff',
    );

    expect(result).toBeNull();
    expect(mockClient).toHaveBeenCalled();
  });

  test('should delete a service order', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as SqlQueryMock;
    mockClient.mockResolvedValue([]);

    const mockTransaction = mockFn<
      (callback: (sql: SqlQueryMock) => Promise<void>) => Promise<void>
    >() as unknown as TransactionMock;

    (
      mockClient as unknown as { transaction: typeof mockTransaction }
    ).transaction = mockTransaction;

    mockTransaction.mockImplementation(async (callback) => {
      await callback(mockClient);
    });

    const repository = new ServiceOrderRepository(mockClient as unknown as SQL);

    await repository.delete('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');

    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find service orders by params', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as SqlQueryMock;
    const queries: string[] = [];

    mockClient.mockImplementation((...args: unknown[]) => {
      const [strings] = args as [TemplateStringsArray];

      queries.push(strings.join(' '));
      return Promise.resolve([]);
    });

    const repository = new ServiceOrderRepository(mockClient as unknown as SQL);

    const result = await repository.findByParams({
      page: 1,
      limit: 10,
      filters: {
        customerId: 'customer-id',
        status: ServiceOrderStatus.IN_EXECUTION,
      },
    });

    expect(result).toEqual([]);
    expect(
      queries.some((query) => query.includes('FROM bunzina.service_orders')),
    ).toBe(true);
    expect(
      queries.some((query) =>
        query
          .replace(/\s+/g, ' ')
          .includes(
            "CASE status WHEN 'IN_EXECUTION' THEN 1 WHEN 'AWAITING_APPROVAL' THEN 2 WHEN 'IN_DIAGNOSTIC' THEN 3 WHEN 'RECEIVED' THEN 4 ELSE 5 END, created_at ASC",
          ),
      ),
    ).toBe(true);
    expect(
      queries.some((query) =>
        query
          .replace(/\s+/g, ' ')
          .includes("status NOT IN ('COMPLETED', 'DELIVERED')"),
      ),
    ).toBe(true);
    expect(mockClient).toHaveBeenCalled();
  });
});
