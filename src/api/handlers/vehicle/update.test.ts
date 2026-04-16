import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { updateVehicleHandler } from './update';

describe('updateVehicleHandler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 200 when updating a vehicle', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const newCustomerId = '550e8400-e29b-41d4-a716-446655440003';
    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: validUUId,
          customer_id: newCustomerId,
          license_plate: 'ABC1D23',
          brand: 'Tesla',
          model: 'Model S',
          year: 2023,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[]),
    );

    const ctx = {
      request: { method: 'PUT' },
      params: { id: validUUId },
      body: {
        customerId: newCustomerId,
        licensePlate: 'ABC1D23',
        brand: 'Tesla',
        model: 'Model S',
        year: 2023,
      },
    } as unknown as Context;

    const result = await updateVehicleHandler(ctx);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when an internal error occurs', async () => {
    const validUUId = '550e8400-e29b-41d4-a716-446655440000';
    const newCustomerId = '550e8400-e29b-41d4-a716-446655440003';
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: {},
      params: { id: validUUId },
      body: {
        customerId: newCustomerId,
        licensePlate: 'ABC1D23',
        brand: 'Tesla',
        model: 'Model S',
        year: 2023,
      },
    } as unknown as Context;

    const result = await updateVehicleHandler(ctx);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({ error: 'Failed to update vehicle' });
  });
});
