import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { listVehiclesHandler } from './list';

describe('listVehiclesHandler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 200 when listing vehicles', async () => {
    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          customer_id: '550e8400-e29b-41d4-a716-446655440002',
          license_plate: 'ABC1D23',
          model: 'Model S',
          brand: 'Tesla',
          year: 2020,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[]),
    );

    const ctx = {
      request: { method: 'GET' },
      query: {
        page: '1',
        limit: '20',
      },
    } as unknown as Context;

    const result = await listVehiclesHandler(ctx);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: { method: 'GET' },
      query: { page: '1', limit: '20' },
    } as unknown as Context;

    const result = await listVehiclesHandler(ctx);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({ error: 'Failed to list vehicles' });
  });
});
