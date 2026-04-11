import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { updateCustomerHandler } from './update';

describe('updateCustomerHandler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('should return 200 when updating a customer', async () => {
    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id: 'customer-id',
          name: 'John Doe',
          document: '12345678909',
          document_kind: 'CPF',
          email: 'john@example.com',
          phone: '+1234567890',
          address_street: '123 Main St',
          address_number: '456',
          address_neighborhood: 'Downtown',
          address_city: 'Anytown',
          address_state: 'CA',
          address_zip_code: '12345',
          address_complement: undefined,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ] as unknown[]),
    );

    const ctx = {
      request: { method: 'PUT' },
      params: { documentNumber: '12345678909' },
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+9876543210',
        address: {
          street: '456 Oak Ave',
          number: '789',
          neighborhood: 'Uptown',
          city: 'Othertown',
          state: 'NY',
          zipCode: '67890',
        },
      },
    } as unknown as Context;

    const result = await updateCustomerHandler(ctx);

    expect(result.status).toBe(200);
    expect(result.headers.get('Content-Type')).toBe('application/json');
  });

  test('should return 500 when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const ctx = {
      request: {},
      params: { documentNumber: '12345678909' },
      body: {
        name: 'Jane Doe',
        email: 'jane@example.com',
        phone: '+9876543210',
        address: {
          street: '456 Oak Ave',
          number: '789',
          neighborhood: 'Uptown',
          city: 'Othertown',
          state: 'NY',
          zipCode: '67890',
        },
      },
    } as unknown as Context;

    const result = await updateCustomerHandler(ctx);

    expect(result.status).toBe(500);
    expect(await result.json()).toEqual({ error: 'Failed to update customer' });
  });
});
