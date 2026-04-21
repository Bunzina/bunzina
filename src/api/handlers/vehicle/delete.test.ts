import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { deleteVehicleHandler } from './delete';

describe('deleteVehicleHandler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 204 when deleting a vehicle', async () => {
    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          customer_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
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
      request: { method: 'DELETE' },
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    } as unknown as Context;

    const result = await deleteVehicleHandler(ctx);

    expect(result.status).toBe(204);
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: {},
      params: { id: '550e8400-e29b-41d4-a716-446655440099' },
    } as unknown as Context;

    const result = await deleteVehicleHandler(ctx);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({ error: 'Failed to delete vehicle' });
  });
});
