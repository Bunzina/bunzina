import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { makeCustomer } from '@/test/factories/make-customer';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { DeleteCustomerUseCase } from './delete';

describe('delete customer use case', () => {
  let customerRepository: MockProxy<CustomerRepository>;
  let deleteCustomerUseCase: DeleteCustomerUseCase;

  beforeEach(() => {
    customerRepository = mock();
    deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);
  });

  test('should delete a customer by document number', async () => {
    const mockCustomer = makeCustomer();

    customerRepository.findByDocumentNumber
      .calledWith(mockCustomer.document.value)
      .mockResolvedValue(mockCustomer);

    await deleteCustomerUseCase.execute({ documentNumber: mockCustomer.document.value });

    expect(customerRepository.findByDocumentNumber).toHaveBeenCalledWith(
      mockCustomer.document.value,
    );
    expect(customerRepository.delete).toHaveBeenCalledWith(mockCustomer.document.value);
  });

  test('should throw NotFoundError if customer does not exist', async () => {
    const input = {
      documentNumber: 'non-existent-document',
    };

    await expect(deleteCustomerUseCase.execute(input)).rejects.toThrow('Customer not found');
    expect(customerRepository.findByDocumentNumber).toHaveBeenCalledWith(input.documentNumber);
    expect(customerRepository.delete).not.toHaveBeenCalled();
  });
});
