import { describe, expect, test, mock } from 'bun:test';
import { makeCustomer } from '@/test/factories/make-customer';
import { CustomerRepository } from './customer-repository';

describe('customer repository', () => {
  test('should create a customer and return it', async () => {
    const mockClient = {
      query: mock(() => Promise.resolve()),
    };

    const repository = new CustomerRepository(mockClient as any); // MODIFICAR DEPOIS
    const customer = makeCustomer();

    const result = await repository.create(customer);

    expect(result).toEqual(customer);
    expect(mockClient.query).toHaveBeenCalled();
  });
});
