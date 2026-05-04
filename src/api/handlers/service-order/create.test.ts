import { makeServiceOrderInput } from '@/test/factories/make-service-order-input';
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

import { createServiceOrderHandler } from './create';

describe('create service order handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
    mockTransaction.mockImplementation(async (callback) => {
      await callback(mockDb);
    });
  });

  test('should return 201 when creating a service order', async () => {
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');

    mockDb
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: '11111111-1111-4111-8111-111111111111',
            name: 'John Doe',
            document: '12345678909',
            document_kind: 'CPF',
            email: 'john@example.com',
            phone: '+5511999999999',
            address_street: 'Rua A',
            address_number: '100',
            address_city: 'Sao Paulo',
            address_state: 'SP',
            address_zip_code: '01001000',
            address_neighborhood: 'Centro',
            address_complement: null,
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: '22222222-2222-4222-8222-222222222222',
            customer_id: '11111111-1111-4111-8111-111111111111',
            license_plate: 'ABC1D23',
            model: 'Model S',
            brand: 'Tesla',
            year: 2020,
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ] as unknown[]),
      )
      .mockImplementationOnce(() =>
        Promise.resolve([
          {
            id: '33333333-3333-4333-8333-333333333333',
            name: 'Oil Change',
            description: 'Complete oil change service',
            price: 200,
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
            id: '55555555-5555-4555-8555-555555555555',
            name: 'Oil Filter',
            description: 'Oil filter',
            price: 50,
            stock: 100,
            is_active: true,
            created_at: createdAt,
            updated_at: updatedAt,
          },
        ] as unknown[]),
      );

    const ctx = {
      request: { method: 'POST' },
      body: makeServiceOrderInput(),
    } as unknown as Context;

    const result = await createServiceOrderHandler(ctx);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
    expect(await result?.json()).toEqual({
      id: expect.any(String),
      customerId: '11111111-1111-4111-8111-111111111111',
      vehicleId: '22222222-2222-4222-8222-222222222222',
      status: 'RECEIVED',
      serviceItems: [
        {
          id: expect.any(String),
          serviceId: '33333333-3333-4333-8333-333333333333',
          price: 200,
          description: 'Oil change service',
        },
      ],
      autoPartItems: [
        {
          id: expect.any(String),
          autoPartId: '55555555-5555-4555-8555-555555555555',
          quantity: 2,
          unitPrice: 50,
          totalPrice: 100,
          description: 'Oil filter',
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
      request: { method: 'POST' },
      body: makeServiceOrderInput(),
    } as unknown as Context;

    const result = await createServiceOrderHandler(ctx);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({
      error: 'Failed to create service order',
    });
  });
});
