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

import { updateServiceOrderStatusHandler } from './update-status';

describe('update service order status handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
    mockTransaction.mockImplementation(async (callback) => {
      await callback(mockDb);
    });
  });

  test('should return 200 when updating service order status', async () => {
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
            auto_part_id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
            quantity: 2,
            unit_price: 40,
            total_price: 80,
            description: 'Brake pad',
          },
        ] as unknown[]),
      );

    const ctx = {
      request: { method: 'PATCH' },
      params: { id: serviceOrderId },
      body: { direction: 'next' },
    } as unknown as Context;

    const result = await updateServiceOrderStatusHandler(ctx);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      id: serviceOrderId,
      customerId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      vehicleId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      status: 'IN_DIAGNOSTIC',
      serviceItems: [
        {
          id: 'service-item-1',
          serviceId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
          price: 120,
          description: 'Brake check',
          isCompleted: false,
        },
      ],
      autoPartItems: [
        {
          id: 'auto-part-item-1',
          autoPartId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
          quantity: 2,
          unitPrice: 40,
          totalPrice: 80,
          description: 'Brake pad',
        },
      ],
      quote: {
        servicesTotal: 120,
        autoPartsTotal: 80,
        total: 200,
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });
});
