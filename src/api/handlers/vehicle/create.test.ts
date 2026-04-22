import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { createVehicleHandler } from './create';

describe('createVehicleHandler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 201 when creating a vehicle', async () => {
    mockDb
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: '550e8400-e29b-41d4-a716-446655440010',
            name: 'John Doe',
            document: '12345678909',
            document_kind: 'CPF',
            email: 'john@example.com',
            phone: '+5511999999999',
            address_street: 'Rua A',
            address_number: '123',
            address_neighborhood: 'Centro',
            address_city: 'Sao Paulo',
            address_state: 'SP',
            address_zip_code: '01001000',
            address_complement: undefined,
            created_at: new Date(),
            updated_at: new Date(),
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() => Promise.resolve([]))
      .mockImplementationOnce(() => Promise.resolve([]));

    const ctx = {
      request: { method: 'POST' },
      body: {
        customerId: '550e8400-e29b-41d4-a716-446655440010',
        licensePlate: 'ABC1D23',
        model: 'Model S',
        brand: 'Tesla',
        year: 2023,
      },
    } as unknown as Context;

    const result = await createVehicleHandler(ctx);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: { method: 'POST' },
      body: {
        customerId: '550e8400-e29b-41d4-a716-446655440010',
        licensePlate: 'ABC1D23',
        model: 'Model S',
        brand: 'Tesla',
        year: 2023,
      },
    } as unknown as Context;

    const result = await createVehicleHandler(ctx);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({ error: 'Failed to create vehicle' });
  });
});
