import { describe, test, expect, mock } from 'bun:test';
import { CreateCustomerInput } from './create';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import type { CreateCustomerUseCase } from '@/application/use-cases/customer/create';
import type { Context } from 'elysia';
import { makeCustomer } from '@/test/factories/make-customer';
import { DocumentKind } from '@/domain/core/types/document-kind';

describe('create customer input', () => {
  test('should create a customer', async () => {
    const customer = makeCustomer();

    const mockCreateCustomerUseCase = {
      execute: mock(() => Promise.resolve(customer)),
    } as unknown as CreateCustomerUseCase;

    const createCustomerInput = new CreateCustomerInput(
      mockCreateCustomerUseCase,
    );

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

    const result = await createCustomerInput.execute(request);

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

    expect(mockCreateCustomerUseCase.execute).toHaveBeenCalledWith({
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
    });
  });

  test('should throw an error if customer creation fails', async () => {
    const mockCreateCustomerUseCase = {
      execute: mock(() =>
        Promise.reject(new Error('Failed to create customer')),
      ),
    } as unknown as CreateCustomerUseCase;

    const createCustomerInput = new CreateCustomerInput(
      mockCreateCustomerUseCase,
    );

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

    const result = await createCustomerInput.execute(request);

    expect(result.status).toBe(500);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({ error: 'Failed to create customer' });

    expect(mockCreateCustomerUseCase.execute).toHaveBeenCalledWith({
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
    });
  });

  test('should throw validation error if input is invalid', async () => {
    const mockCreateCustomerUseCase = {
      execute: mock(() => Promise.resolve()),
    } as unknown as CreateCustomerUseCase;

    const createCustomerInput = new CreateCustomerInput(
      mockCreateCustomerUseCase,
    );

    const request = {
      body: {
        name: 'John Doe',
        document: '77777777777',
        email: 'johnexample.com',
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

    const result = await createCustomerInput.execute(request);

    expect(result.status).toBe(400);
    expect(result.headers.get('Content-Type')).toBe('application/json');
    expect(await result.json()).toEqual({
      error: 'Invalid data in request',
      issues: [
        {
          message: 'Invalid document number (CPF or CNPJ)',
          path: 'document',
        },
        {
          message: 'Invalid email address',
          path: 'email',
        },
      ],
    });
  });

  test('should create a customer with CNPJ', async () => {
    const customer = makeCustomer({
      document: {
        value: '45723174000110',
        kind: DocumentKind.CNPJ,
      },
    });

    const mockCreateCustomerUseCase = {
      execute: mock(() => Promise.resolve(customer)),
    } as unknown as CreateCustomerUseCase;

    const createCustomerInput = new CreateCustomerInput(
      mockCreateCustomerUseCase,
    );

    const request = {
      body: {
        name: 'Empresa LTDA',
        document: '45.723.174/0001-10',
        email: 'empresa@example.com',
        phone: '+5511999999999',
        address: {
          street: 'Av Paulista',
          number: '1000',
          neighborhood: 'Bela Vista',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01310-100',
          complement: 'Sala 101',
        },
      },
    } as Context;

    const result = await createCustomerInput.execute(request);

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
      document: '45723174000110',
      documentKind: 'CNPJ',
      email: 'lucas.coda.fofo@gmail.com',
      id: 'customer-id',
      name: 'John Doe',
      phone: '+1234567890',
      updatedAt: expect.any(String),
    });

    expect(mockCreateCustomerUseCase.execute).toHaveBeenCalledWith({
      name: 'Empresa LTDA',
      document: '45723174000110',
      email: 'empresa@example.com',
      phone: '+5511999999999',
      address: {
        street: 'Av Paulista',
        number: '1000',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        complement: 'Sala 101',
      },
    });
  });
});
