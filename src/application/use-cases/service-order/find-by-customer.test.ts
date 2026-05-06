import { makeCustomer } from '@/test/factories/make-customer';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { any, mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { FindServiceOrdersByCustomerUseCase } from './find-by-customer';

describe('find service orders by customer use case', () => {
  let customerRepository: MockProxy<CustomerRepository>;
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let findServiceOrdersByCustomerUseCase: FindServiceOrdersByCustomerUseCase;

  beforeEach(() => {
    customerRepository = mock();
    serviceOrderRepository = mock();
    findServiceOrdersByCustomerUseCase = new FindServiceOrdersByCustomerUseCase(
      customerRepository,
      serviceOrderRepository,
    );
  });

  test('should find service orders for a customer', async () => {
    const customer = makeCustomer({ id: 'customer-id' });
    const serviceOrder = makeServiceOrder({
      id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
      customerId: customer.id,
    });

    customerRepository.findByDocumentNumber
      .calledWith(any())
      .mockResolvedValue(customer);
    serviceOrderRepository.findByParams
      .calledWith(any())
      .mockResolvedValue([serviceOrder]);

    const result = await findServiceOrdersByCustomerUseCase.execute({
      documentNumber: customer.document.value,
    });

    expect(result).toEqual([serviceOrder]);
    expect(customerRepository.findByDocumentNumber).toHaveBeenCalledWith(
      customer.document.value,
    );
    expect(serviceOrderRepository.findByParams).toHaveBeenCalledWith({
      page: 1,
      limit: Number.MAX_SAFE_INTEGER,
      filters: {
        customerId: customer.id,
      },
    });
  });

  test('should return an empty array when customer is not found', async () => {
    customerRepository.findByDocumentNumber
      .calledWith(any())
      .mockResolvedValue(null);

    const result = await findServiceOrdersByCustomerUseCase.execute({
      documentNumber: '12345678909',
    });

    expect(result).toEqual([]);
    expect(customerRepository.findByDocumentNumber).toHaveBeenCalledWith(
      '12345678909',
    );
    expect(serviceOrderRepository.findByParams).not.toHaveBeenCalled();
  });

  test('should throw when repository fails', async () => {
    customerRepository.findByDocumentNumber
      .calledWith(any())
      .mockRejectedValue(new Error('db error'));

    await expect(
      findServiceOrdersByCustomerUseCase.execute({
        documentNumber: '12345678909',
      }),
    ).rejects.toThrow('db error');
  });
});