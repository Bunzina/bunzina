import { mockFn } from 'bun-mock-extended';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { listServiceOrdersHandler } from './list';

describe('list service orders handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should call listServiceOrdersHandler and return service orders', async () => {
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    mockDb.mockImplementationOnce(() =>
      Promise.resolve([
        {
          id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
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
    );
    mockDb.mockImplementationOnce(() => Promise.resolve([]));
    mockDb.mockImplementationOnce(() => Promise.resolve([]));

    const context = {
      request: { method: 'GET' },
      query: {
        page: '1',
        limit: '10',
      },
    } as unknown as Context;

    const response = await listServiceOrdersHandler(context);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      data: expect.any(Array),
      pagination: {
        page: 1,
        limit: 10,
      },
    });
  });

  test('should handle filter by customerId query parameter', async () => {
    const customerId = '550e8400-e29b-41d4-a716-446655440001';

    const context = {
      request: { method: 'GET' },
      query: {
        page: '1',
        limit: '10',
        customerId,
      },
    } as unknown as Context;

    const response = await listServiceOrdersHandler(context);

    expect(response.status).toBe(200);
  });

  test('should handle filter by vehicleId query parameter', async () => {
    const vehicleId = '550e8400-e29b-41d4-a716-446655440002';

    const context = {
      request: { method: 'GET' },
      query: {
        page: '1',
        limit: '10',
        vehicleId,
      },
    } as unknown as Context;

    const response = await listServiceOrdersHandler(context);

    expect(response.status).toBe(200);
  });

  test('should handle filter by status query parameter', async () => {
    const status = ServiceOrderStatus.IN_EXECUTION;

    const context = {
      request: { method: 'GET' },
      query: {
        page: '1',
        limit: '10',
        status,
      },
    } as unknown as Context;

    const response = await listServiceOrdersHandler(context);

    expect(response.status).toBe(200);
  });

  test('should handle multiple filters combined', async () => {
    const customerId = '550e8400-e29b-41d4-a716-446655440001';
    const vehicleId = '550e8400-e29b-41d4-a716-446655440002';
    const status = ServiceOrderStatus.RECEIVED;

    const context = {
      request: { method: 'GET' },
      query: {
        page: '1',
        limit: '10',
        customerId,
        vehicleId,
        status,
      },
    } as unknown as Context;

    const response = await listServiceOrdersHandler(context);

    expect(response.status).toBe(200);
  });

  test('should return empty list when no service orders found', async () => {
    const context = {
      request: { method: 'GET' },
      query: {
        page: '1',
        limit: '10',
        customerId: '550e8400-e29b-41d4-a716-446655440003',
      },
    } as unknown as Context;

    const response = await listServiceOrdersHandler(context);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      data: [],
      pagination: {
        page: 1,
        limit: 10,
      },
    });
  });
});
