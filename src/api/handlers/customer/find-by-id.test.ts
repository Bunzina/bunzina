import { mockFn } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock, test, type Mock } from 'bun:test';
import type { Context } from 'elysia';

const mockDb = mockFn<
  (..._args: unknown[]) => Promise<unknown[]>
>() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
mockDb.mockImplementation(() => Promise.resolve([]));
mock.module('@/infrastructure/configs/database', () => ({ db: mockDb }));

import { findCustomerByIdHandler } from './find-by-id';

describe('findCustomerByIdHandler', () => {
  beforeEach(() => {
    mockDb.mockImplementation(() => Promise.resolve([]));
  });

  test('returns the complete customer response when the ID exists', async () => {
    const id = '550e8400-e29b-41d4-a716-446655440000';
    const createdAt = new Date('2025-06-15T12:00:00.000Z');
    const updatedAt = new Date('2025-06-16T12:00:00.000Z');
    mockDb.mockImplementation(() =>
      Promise.resolve([
        {
          id,
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
          address_complement: null,
          created_at: createdAt,
          updated_at: updatedAt,
        },
      ] as unknown[]),
    );

    const context = {
      request: { method: 'GET' },
      params: { id },
    } as unknown as Context;

    const response = await findCustomerByIdHandler(context);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual({
      id,
      name: 'John Doe',
      document: '12345678909',
      documentKind: 'CPF',
      email: 'john@example.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        number: '456',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        neighborhood: 'Downtown',
        complement: null,
      },
      createdAt: '2025-06-15',
      updatedAt: '2025-06-16',
    });
  });

  test('returns the complete not-found response when the ID does not exist', async () => {
    const context = {
      request: { method: 'GET' },
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    } as unknown as Context;

    const response = await findCustomerByIdHandler(context);

    expect(response.status).toBe(404);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual({
      reason: 'Customer not found',
    });
  });

  test('returns the complete error response when an internal error occurs', async () => {
    mockDb.mockImplementation(() => {
      throw new Error('db error');
    });

    const context = {
      request: { method: 'GET' },
      params: { id: '550e8400-e29b-41d4-a716-446655440000' },
    } as unknown as Context;

    const response = await findCustomerByIdHandler(context);

    expect(response.status).toBe(500);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(await response.json()).toEqual({
      error: 'Failed to find customer by id',
    });
  });
});
