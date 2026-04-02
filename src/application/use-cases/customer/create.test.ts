import { describe, test, expect, mock } from 'bun:test';
import { CreateCustomerUseCase } from './create';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';

describe('create customer use case', () => {
  test('should create a customer with all fields', async () => {
    const mockCustomerRepository = {
      create: mock(() => Promise.resolve()),
    } as unknown as CustomerRepository;

    const createCustomerUseCase = new CreateCustomerUseCase(
      mockCustomerRepository,
    );

    const input = {
      name: 'John Doe',
      document: '123.456.789-09',
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
    };

    const result = await createCustomerUseCase.execute(input);

    expect(result).toMatchObject({
      address: {
        city: 'Anytown',
        neighborhood: 'Downtown',
        number: '456',
        state: 'CA',
        street: '123 Main St',
        zipCode: '12345',
        complement: 'Near the park',
      },
      createdAt: expect.any(Date),
      document: {
        kind: 'CPF',
        value: '12345678909',
      },
      email: {
        value: 'john@example.com',
      },
      id: expect.any(String),
      name: 'John Doe',
      phone: {
        value: '+1234567890',
      },
      updatedAt: expect.any(Date),
    });

    expect(mockCustomerRepository.create).toHaveBeenCalledWith(result);
  });

  test('should create a customer without optional fields', async () => {
    const mockCustomerRepository = {
      create: mock(() => Promise.resolve()),
    } as unknown as CustomerRepository;

    const createCustomerUseCase = new CreateCustomerUseCase(
      mockCustomerRepository,
    );

    const input = {
      name: 'John Doe',
      document: '123.456.789-09',
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
    };

    const result = await createCustomerUseCase.execute(input);

    expect(result).toMatchObject({
      address: {
        city: 'Anytown',
        neighborhood: 'Downtown',
        number: '456',
        state: 'CA',
        street: '123 Main St',
        zipCode: '12345',
      },
      createdAt: expect.any(Date),
      document: {
        kind: 'CPF',
        value: '12345678909',
      },
      email: {
        value: 'john@example.com',
      },
      id: expect.any(String),
      name: 'John Doe',
      phone: {
        value: '+1234567890',
      },
      updatedAt: expect.any(Date),
    });

    expect(mockCustomerRepository.create).toHaveBeenCalledWith(result);
  });
});
