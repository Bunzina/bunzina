import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { createCustomerHandler } from './create';

describe('create customer handler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 201 when creating a customer', async () => {
    const ctx = {
      request: { method: 'POST' },
      body: {
        name: 'John Doe',
        document: '12345678909',
        email: 'john@example.com',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          number: '456',
          neighborhood: 'Downtown',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
        },
      },
    } as unknown as Context;

    const result = await createCustomerHandler(ctx);

    expect(result?.status).toBe(201);
    expect(result?.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: {},
      body: {
        name: 'John Doe',
        document: '12345678909',
        email: 'john@example.com',
        phone: '+1234567890',
        address: {
          street: '123 Main St',
          number: '456',
          neighborhood: 'Downtown',
          city: 'Anytown',
          state: 'CA',
          zipCode: '12345',
        },
      },
    } as unknown as Context;

    const result = await createCustomerHandler(ctx);

    expect(result?.status).toBe(500);
    expect(await result?.json()).toEqual({
      error: 'Failed to create customer',
    });
  });
});
