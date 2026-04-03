import { DocumentKind } from '@/domain/core/types/document-kind';
import { makeCustomer } from '@/test/factories/make-customer';
import { describe, expect, test } from 'bun:test';
import { CustomerPresenter } from './customer-presenter';

describe('customer presenter', () => {
  test('should convert a customer entity to http response', () => {
    const customer = makeCustomer();

    const response = CustomerPresenter.toHttp(customer);

    expect(response).toEqual({
      id: 'customer-id',
      name: 'John Doe',
      document: '12345678909',
      documentKind: DocumentKind.CPF,
      email: 'lucas.coda.fofo@gmail.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        number: '456',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        neighborhood: 'Downtown',
        complement: 'Apt 789',
      },
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });
  });

  test('should convert a customer without optionals', () => {
    const customDate = new Date('2024-01-01');
    const customer = makeCustomer({
      name: 'Jane Smith',
      createdAt: customDate,
      updatedAt: customDate,
      address: {
        street: '123 Main St',
        number: '456',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        neighborhood: 'Downtown',
      },
    });

    const response = CustomerPresenter.toHttp(customer);

    expect(response).toEqual({
      id: 'customer-id',
      name: 'Jane Smith',
      document: '12345678909',
      documentKind: DocumentKind.CPF,
      email: 'lucas.coda.fofo@gmail.com',
      phone: '+1234567890',
      address: {
        street: '123 Main St',
        number: '456',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        neighborhood: 'Downtown',
        complement: undefined,
      },
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01',
    });
  });
});
