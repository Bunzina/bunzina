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
