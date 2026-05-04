import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import { makeCustomer } from '@/test/factories/make-customer';
import { mock, type MockProxy } from 'bun-mock-extended';
import { FindCustomerByIdUseCase } from './find-by-id';

describe('find customer by id use case', () => {
  let customerRepository: MockProxy<CustomerRepository>;
  let findCustomerByIdUseCase: FindCustomerByIdUseCase;

  beforeEach(() => {
    customerRepository = mock();
    findCustomerByIdUseCase = new FindCustomerByIdUseCase(customerRepository);
  });

  test('should find a customer by id', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const customer = makeCustomer({ id });

    customerRepository.findById.calledWith(id).mockResolvedValue(customer);

    const result = await findCustomerByIdUseCase.execute({ id });

    expect(result).toEqual(customer);
    expect(customerRepository.findById).toHaveBeenCalledWith(id);
  });

  test('should throw NotFoundError if customer is not found', async () => {
    const id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

    customerRepository.findById.calledWith(id).mockResolvedValue(null);

    await expect(findCustomerByIdUseCase.execute({ id })).rejects.toThrow(
      'Customer not found',
    );
    expect(customerRepository.findById).toHaveBeenCalledWith(id);
  });
});
