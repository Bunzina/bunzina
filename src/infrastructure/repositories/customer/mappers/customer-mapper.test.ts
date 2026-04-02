import { describe, expect, test, mock } from 'bun:test';
import { makeCustomer } from '@/test/factories/make-customer';
import { CustomerMapper } from './customer-mapper';

describe('customer mapper', () => {
  test('should map customer domain to database schema', async () => {
    const customer = makeCustomer({
      createdAt: new Date('2026-03-10'),
      updatedAt: new Date('2026-03-10'),
    });

    const result = CustomerMapper.toDatabase(customer);

    expect(result).toMatchObject({
      address_city: 'Anytown',
      address_complement: 'Apt 789',
      address_neighborhood: 'Downtown',
      address_number: '456',
      address_state: 'CA',
      address_street: '123 Main St',
      address_zip_code: '12345',
      created_at: new Date('2026-03-10'),
      document: '12345678900',
      document_kind: 'CPF',
      email: 'lucas.coda.fofo@gmail.com',
      id: 'customer-id',
      name: 'John Doe',
      phone: '+1234567890',
      updated_at: new Date('2026-03-10'),
    });
  });
});
