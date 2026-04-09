import { makeCustomer } from '@/test/factories/make-customer';
import { SQL } from 'bun';
import { mockFn } from 'bun-mock-extended';
import { describe, expect, test, type Mock } from 'bun:test';
import { CustomerRepository } from './customer-repository';

describe('customer repository', () => {
  test('should create a customer and return it', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new CustomerRepository(mockClient as unknown as SQL);
    const customer = makeCustomer();

    const result = await repository.create(customer);

    expect(result).toEqual(customer);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should update a customer and return it', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new CustomerRepository(mockClient as unknown as SQL);
    const customer = makeCustomer();

    const result = await repository.update(customer);

    expect(result).toEqual(customer);
    expect(mockClient).toHaveBeenCalled();
  });

  test('should delete a customer by document number', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new CustomerRepository(mockClient as unknown as SQL);

    await repository.delete('12345678909');

    expect(mockClient).toHaveBeenCalled();
  });
});
