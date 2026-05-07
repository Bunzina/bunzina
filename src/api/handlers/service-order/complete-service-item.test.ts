import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, test, mock, type Mock } from 'bun:test';
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

import { completeServiceItemHandler } from './complete-service-item';

describe('complete service item handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 200 when completing a service item', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const finishedAt = new Date('2026-04-02T10:00:00.000Z');

    mockDb
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id,
            service_order_id: 'so-1',
            service_id: 'svc-1',
            price: 100,
            description: 'Service',
            created_at: createdAt,
            updated_at: createdAt,
            is_completed: false,
            finished_at: null,
            execution_time_ms: null,
          },
        ]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            service_order_id: 'so-1',
          },
        ]),
      )

      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'so-1',
            customer_id: 'c-1',
            vehicle_id: 'v-1',
            status: 'IN_EXECUTION',
            quote_services_total: 0,
            quote_auto_parts_total: 0,
            quote_total: 0,
            created_at: new Date(),
            updated_at: new Date(),
            approved_at: null,
            started_at: new Date(),
            completed_at: null,
            delivered_at: null,
          },
        ]),
      )
      .mockImplementationOnce(() => Promise.resolve([]))
      .mockImplementationOnce(() => Promise.resolve([]))
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id,
            service_order_id: 'so-1',
            service_id: 'svc-1',
            price: 100,
            description: 'Service',
            created_at: createdAt,
            updated_at: finishedAt,
            is_completed: true,
            finished_at: finishedAt,
            execution_time_ms: BigInt(
              finishedAt.getTime() - createdAt.getTime(),
            ),
          },
        ]),
      );

    const ctx = {
      request: { method: 'POST' },
      params: { id },
    } as unknown as Context;

    const res = await completeServiceItemHandler(ctx);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      id,
      serviceId: 'svc-1',
      price: 100,
      description: 'Service',
      isCompleted: true,
      finishedAt: expect.any(String),
      executionTimeMs: expect.any(Number),
    });
  });

  test('should throw 404 when service item is not found', async () => {
    const id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

    mockDb.mockImplementationOnce(() => Promise.resolve([]));

    const ctx = {
      request: { method: 'POST' },
      params: { id },
    } as unknown as Context;

    const res = await completeServiceItemHandler(ctx);
    expect(res.status).toBe(404);
  });

  test('should throw 400 when service item is already completed', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');

    mockDb.mockImplementationOnce(() =>
      Promise.resolve([
        {
          id,
          service_order_id: 'so-1',
          service_id: 'svc-1',
          price: 100,
          description: 'Service',
          created_at: createdAt,
          updated_at: createdAt,
          is_completed: true,
          finished_at: createdAt,
          execution_time_ms: BigInt(0),
        },
      ]),
    );

    const ctx = {
      request: { method: 'POST' },
      params: { id },
    } as unknown as Context;

    const res = await completeServiceItemHandler(ctx);
    expect(res.status).toBe(400);
  });

  test('should throw 403 when service order is not in execution', async () => {
    const id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');

    mockDb
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id,
            service_order_id: 'so-2',
            service_id: 'svc-1',
            price: 100,
            description: 'Service',
            created_at: createdAt,
            updated_at: createdAt,
            is_completed: false,
            finished_at: null,
            execution_time_ms: null,
          },
        ]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([{ service_order_id: 'so-2' }]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: 'so-2',
            customer_id: 'c-1',
            vehicle_id: 'v-1',
            status: 'APPROVED',
            quote_services_total: 0,
            quote_auto_parts_total: 0,
            quote_total: 0,
            created_at: new Date(),
            updated_at: new Date(),
            approved_at: null,
            started_at: null,
            completed_at: null,
            delivered_at: null,
          },
        ]),
      );

    const ctx = {
      request: { method: 'POST' },
      params: { id },
    } as unknown as Context;

    const res = await completeServiceItemHandler(ctx);
    expect(res.status).toBe(403);
  });

  test('should throw 404 when service order is not found', async () => {
    const id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');

    mockDb
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id,
            service_order_id: 'so-3',
            service_id: 'svc-1',
            price: 100,
            description: 'Service',
            created_at: createdAt,
            updated_at: createdAt,
            is_completed: false,
            finished_at: null,
            execution_time_ms: null,
          },
        ]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([{ service_order_id: 'so-3' }]),
      )
      .mockImplementationOnce(() => Promise.resolve([]));

    const ctx = {
      request: { method: 'POST' },
      params: { id },
    } as unknown as Context;

    const res = await completeServiceItemHandler(ctx);
    expect(res.status).toBe(404);
  });
});
