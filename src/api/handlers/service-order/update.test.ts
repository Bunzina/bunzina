import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
const mockTransaction =
  mockFn<(callback: (sql: typeof mockDb) => Promise<void>) => Promise<void>>();
(mockDb as unknown as { transaction: typeof mockTransaction }).transaction =
  mockTransaction;
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { updateServiceOrderHandler } from './update';

describe('update service order handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
    mockTransaction.mockImplementation(async (callback) => {
      await callback(mockDb);
    });
  });

  test('should return 200 when updating a service order', async () => {
    const serviceOrderId = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    mockDb
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: serviceOrderId,
            customer_id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
            vehicle_id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
            status: 'RECEIVED',
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
            auto_part_id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
            quantity: 2,
            unit_price: 40,
            total_price: 80,
            description: 'Brake pad',
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            name: 'Brake check',
            description: 'Brake check',
            price: 120,
            duration_in_minutes: 60,
            is_active: true,
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            name: 'Alignment',
            description: 'Alignment',
            price: 80,
            duration_in_minutes: 30,
            is_active: true,
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
            name: 'Brake pad',
            description: 'Brake pad',
            price: 50,
            stock: 100,
            is_active: true,
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ] as unknown[]),
      );

    const ctx = {
      request: { method: 'PUT' },
      params: { id: serviceOrderId },
      body: {
        serviceItems: [
          {
            serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
            description: 'Brake check',
          },
          {
            serviceId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            price: 80,
          },
        ],
        autoPartItems: [
          {
            autoPartId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
            quantity: 2,
            unitPrice: 50,
            description: 'Brake pad',
          },
        ],
      },
    } as unknown as Context;

    const result = await updateServiceOrderHandler(ctx);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      id: serviceOrderId,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: 'RECEIVED',
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          price: 120,
          description: 'Brake check',
          isCompleted: false,
        },
        {
          id: expect.any(String),
          serviceId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          price: 80,
          description: undefined,
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
          quantity: 2,
          unitPrice: 50,
          totalPrice: 100,
          description: 'Brake pad',
        },
      ],
      quote: {
        servicesTotal: 200,
        autoPartsTotal: 100,
        total: 300,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: { method: 'PUT' },
      params: { id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa' },
      body: {
        serviceItems: [
          {
            serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
            price: 120,
          },
        ],
        autoPartItems: [],
      },
    } as unknown as Context;

    const result = await updateServiceOrderHandler(ctx);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({
      error: 'Failed to update service order',
    });
  });
});
