import { makeCustomer } from '@/test/factories/make-customer';
import { describe, expect, test } from 'bun:test';
import { CustomerMapper } from './customer-mapper';
import type { CustomerDbSchema } from '../dtos/customer-db-schema';

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
      document: '12345678909',
      document_kind: 'CPF',
      email: 'lucas.coda.fofo@gmail.com',
      id: 'customer-id',
      name: 'John Doe',
      phone: '+1234567890',
      updated_at: new Date('2026-03-10'),
    });
  });

  test('should map customer database schema to domain', async () => {
    const record = {
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
      email: 'email@email.com',
      id: 'customer-id',
      name: 'John Doe',
      phone: '+1234567890',
      updated_at: new Date('2026-03-10'),
    };

    const result = CustomerMapper.toDomain(record as CustomerDbSchema);

    expect(result).toMatchObject({
      address: {
        city: 'Anytown',
        complement: 'Apt 789',
        neighborhood: 'Downtown',
        number: '456',
        state: 'CA',
        street: '123 Main St',
        zipCode: '12345',
      },
      createdAt: new Date('2026-03-10'),
      document: {
        kind: 'CPF',
        value: '12345678900',
      },
      email: {
        value: 'email@email.com',
      },
      id: 'customer-id',
      name: 'John Doe',
      phone: {
        value: '+1234567890',
      },
      updatedAt: new Date('2026-03-10'),
    });
  });
});
