import { makeCustomer } from '@/test/factories/make-customer';
import { SQL } from 'bun';
import { describe, expect, mock, test } from 'bun:test';
import { CustomerRepository } from './customer-repository';

describe('customer repository', () => {
  test('should create a customer and return it', async () => {
    const mockClient = mock((..._args: unknown[]) => Promise.resolve([]));

    const repository = new CustomerRepository(mockClient as unknown as SQL);
    const customer = makeCustomer();

    const result = await repository.create(customer);

    expect(result).toEqual(customer);
    expect(mockClient).toHaveBeenCalled();
  });
});
