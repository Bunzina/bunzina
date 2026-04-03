import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { makeCustomer } from '@/test/factories/make-customer';
import type { MockProxy } from 'bun-mock-extended';
import { mock } from 'bun-mock-extended';
import { FindCustomerUseCase } from './find';

describe('find customer use case', () => {
  let customerRepository: MockProxy<CustomerRepository>;
  let findCustomerUseCase: FindCustomerUseCase;

  beforeEach(() => {
    customerRepository = mock();
    findCustomerUseCase = new FindCustomerUseCase(customerRepository);
  });

  test('should find a customer by document number', async () => {
    const mockCustomer = makeCustomer();

    customerRepository.findByDocumentNumber
      .calledWith(mockCustomer.document.value)
      .mockResolvedValue(mockCustomer);

    const input = {
      documentNumber: mockCustomer.document.value,
    };

    const result = await findCustomerUseCase.execute(input);

    expect(result).toEqual(mockCustomer);
    expect(customerRepository.findByDocumentNumber).toHaveBeenCalledWith(input.documentNumber);
  });

  test('should throw NotFoundError if customer is not found', async () => {
    const input = {
      documentNumber: 'non-existent-document',
    };

    await expect(findCustomerUseCase.execute(input)).rejects.toThrow('Customer not found');
    expect(customerRepository.findByDocumentNumber).toHaveBeenCalledWith(input.documentNumber);
  });
});
