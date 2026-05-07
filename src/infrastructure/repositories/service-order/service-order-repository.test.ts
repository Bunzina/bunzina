import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
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

    const mockTransaction = mockFn<
      (callback: (sql: typeof mockClient) => Promise<void>) => Promise<void>
    >() as unknown as Mock<
      (callback: (sql: typeof mockClient) => Promise<void>) => Promise<void>
    >;

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
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const mockTransaction = mockFn<
      (callback: (sql: typeof mockClient) => Promise<void>) => Promise<void>
    >() as unknown as Mock<
      (callback: (sql: typeof mockClient) => Promise<void>) => Promise<void>
    >;

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
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

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
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
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
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const mockTransaction = mockFn<
      (callback: (sql: typeof mockClient) => Promise<void>) => Promise<void>
    >() as unknown as Mock<
      (callback: (sql: typeof mockClient) => Promise<void>) => Promise<void>
    >;

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
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    const serviceOrder = makeServiceOrder({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      customerId: 'customer-id',
      vehicleId: 'vehicle-id',
      createdAt,
      updatedAt,
    });
    const [serviceItem] = serviceOrder.serviceItems;
    const [autoPartItem] = serviceOrder.autoPartItems;

    mockClient
      .mockImplementationOnce(() => Promise.resolve([] as unknown[]))
      .mockImplementationOnce(() => Promise.resolve([] as unknown[]))
      .mockImplementationOnce(() => Promise.resolve([] as unknown[]))
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: serviceOrder.id,
            customer_id: serviceOrder.customerId,
            vehicle_id: serviceOrder.vehicleId,
            status: serviceOrder.status,
            quote_services_total: serviceOrder.quote.servicesTotal,
            quote_auto_parts_total: serviceOrder.quote.autoPartsTotal,
            quote_total: serviceOrder.quote.total,
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
            id: serviceItem!.id,
            service_order_id: serviceOrder.id,
            service_id: serviceItem!.serviceId,
            price: serviceItem!.price.value,
            description: serviceItem!.description,
            created_at: serviceItem!.createdAt,
            updated_at: serviceItem!.updatedAt,
            is_completed: serviceItem!.isCompleted ?? false,
            finished_at: null,
            execution_time_ms: null,
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: autoPartItem!.id,
            service_order_id: serviceOrder.id,
            auto_part_id: autoPartItem!.autoPartId,
            quantity: autoPartItem!.quantity,
            unit_price: autoPartItem!.unitPrice.value,
            total_price: autoPartItem!.totalPrice?.value,
            description: autoPartItem!.description,
          },
        ] as unknown[]),
      );

    const repository = new ServiceOrderRepository(mockClient as unknown as SQL);

    const result = await repository.findByParams({
      page: 1,
      limit: 10,
      filters: {
        customerId: 'customer-id',
      },
    });

    expect(result).toEqual([serviceOrder]);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find a service item by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const serviceOrderId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    mockClient.mockResolvedValueOnce([
      {
        id: 'service-item-1',
        service_order_id: serviceOrderId,
        service_id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
        price: 120,
        description: 'Brake check',
        created_at: createdAt,
        updated_at: updatedAt,
        is_completed: false,
        finished_at: null,
        execution_time_ms: null,
      },
    ] as unknown[]);

    const repository = new ServiceOrderRepository(mockClient as unknown as SQL);

    const result = await repository.findServiceItemById('service-item-1');

    const expected = {
      id: 'service-item-1',
      serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      price: {
        value: 120,
      },
      description: 'Brake check',
      createdAt,
      updatedAt,
      isCompleted: false,
    } as unknown as typeof result;

    expect(result).not.toBeNull();
    expect(result).toEqual(expected);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should find service order by service item id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const serviceOrderId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    mockClient
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            service_order_id: serviceOrderId,
          },
        ] as unknown[]),
      )
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
            created_at: createdAt,
            updated_at: updatedAt,
            is_completed: false,
            finished_at: null,
            execution_time_ms: null,
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

    const result = await repository.findByServiceItemId('service-item-1');

    const expected = {
      id: serviceOrderId,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: [
        {
          id: 'service-item-1',
          serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          price: { value: 120 },
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
          unitPrice: { value: 40 },
          totalPrice: { value: 80 },
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
});
