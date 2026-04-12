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

  test('should find a customer by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;

    const customerRecord = {
      id: 'customer-123',
      name: 'John Doe',
      document: '12345678909',
      document_kind: 'CPF',
      email: 'john@example.com',
      phone: '+1234567890',
      address_street: '123 Main St',
      address_number: '456',
      address_city: 'Anytown',
      address_state: 'CA',
      address_zip_code: '12345',
      address_neighborhood: 'Downtown',
      address_complement: 'Apt 789',
      created_at: new Date(),
      updated_at: new Date(),
    };

    mockClient.mockResolvedValue([customerRecord]);

    const repository = new CustomerRepository(mockClient as unknown as SQL);

    const result = await repository.findById('customer-123');

    expect(result).not.toBeNull();
    expect(result?.id).toBe('customer-123');
    expect(result?.name).toBe('John Doe');
    expect(mockClient).toHaveBeenCalled();
  });

  test('should return null if customer not found by id', async () => {
    const mockClient = mockFn<
      (..._args: unknown[]) => Promise<unknown[]>
    >() as unknown as Mock<(..._args: unknown[]) => Promise<unknown[]>>;
    mockClient.mockResolvedValue([]);

    const repository = new CustomerRepository(mockClient as unknown as SQL);

    const result = await repository.findById('non-existent-id');

    expect(result).toBeNull();
    expect(mockClient).toHaveBeenCalled();
  });
});
