import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { makeCustomer } from '@/test/factories/make-customer';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { UpdateCustomerUseCase } from './update';

describe('update customer use case', () => {
  let customerRepository: MockProxy<CustomerRepository>;
  let updateCustomerUseCase: UpdateCustomerUseCase;

  beforeEach(() => {
    customerRepository = mock();
    updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
  });

  test('should update a customer', async () => {
    const existingCustomer = makeCustomer();

    customerRepository.findByDocumentNumber
      .calledWith(existingCustomer.document.value)
      .mockResolvedValue(existingCustomer);

    const input = {
      documentNumber: existingCustomer.document.value,
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+9876543210',
      address: {
        street: '456 Oak Ave',
        number: '789',
        neighborhood: 'Uptown',
        city: 'Othertown',
        state: 'NY',
        zipCode: '67890',
      },
    };

    const result = await updateCustomerUseCase.execute(input);

    expect(result.name).toBe('Jane Doe');
    expect(result.email.value).toBe('jane@example.com');
    expect(result.phone.value).toBe('+9876543210');
    expect(result.address.street).toBe('456 Oak Ave');
    expect(result.updatedAt).toBeInstanceOf(Date);
    expect(customerRepository.update).toHaveBeenCalledWith(result);
  });

  test('should throw NotFoundError if customer does not exist', async () => {
    const input = {
      documentNumber: '99999999999',
      name: 'Jane Doe',
      email: 'jane@example.com',
      phone: '+9876543210',
      address: {
        street: '456 Oak Ave',
        number: '789',
        neighborhood: 'Uptown',
        city: 'Othertown',
        state: 'NY',
        zipCode: '67890',
      },
    };

    await expect(updateCustomerUseCase.execute(input)).rejects.toThrow('Customer not found');
    expect(customerRepository.findByDocumentNumber).toHaveBeenCalledWith('99999999999');
    expect(customerRepository.update).not.toHaveBeenCalled();
  });
});
