import { describe, test, expect, mock } from 'bun:test';
import { createCustomerHandler } from './create';
import type { Context } from 'elysia';
import { makeCustomer } from '@/test/factories/make-customer';

describe('create customer handler', () => {
  test('should create a customer successfully', async () => {
    const customer = makeCustomer();

    const request = {
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
          complement: 'Near the park',
        },
      },
    } as Context;

    const result = await createCustomerHandler(request);

    expect(result.status).toBe(201);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      address: {
        city: 'Anytown',
        complement: 'Apt 789',
        neighborhood: 'Downtown',
        number: '456',
        state: 'CA',
        street: '123 Main St',
        zipCode: '12345',
      },
      createdAt: expect.any(String),
      document: '12345678900',
      documentKind: 'CPF',
      email: 'lucas.coda.fofo@gmail.com',
      id: 'customer-id',
      name: 'John Doe',
      phone: '+1234567890',
      updatedAt: expect.any(String),
    });
  });

  test('should return 500 on error', async () => {
    const request = {
      body: {
        name: 'John Doe',
        document: 'invalid',
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
    } as Context;

    const result = await createCustomerHandler(request);

    expect(result.status).toBe(500);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      error: 'Failed to create customer',
    });
  });
});
