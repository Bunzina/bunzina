import { describe, test, expect } from 'bun:test';
import { CustomerPresenter } from './customer-presenter';
import { makeCustomer } from '@/test/factories/make-customer';
import { DocumentKind } from '@/domain/core/types/document-kind';

describe('customer presenter', () => {
  test('should convert a customer entity to http response', () => {
    const customer = makeCustomer();

    const response = CustomerPresenter.toHttp(customer);

    expect(response).toEqual({
      id: 'customer-id',
      name: 'John Doe',
      document: '12345678900',
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
      createdAt: expect.any(Date),
      updatedAt: expect.any(Date),
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
      document: '12345678900',
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
      createdAt: customDate,
      updatedAt: customDate,
    });
  });
});
