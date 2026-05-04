import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { mock, type MockProxy } from 'bun-mock-extended';
import { FindServiceOrderByIdUseCase } from './find-by-id';

describe('find service order by id use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    findServiceOrderByIdUseCase = new FindServiceOrderByIdUseCase(
      serviceOrderRepository,
    );
  });

  test('should find a service order by id', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const serviceOrder = makeServiceOrder({ id });

    serviceOrderRepository.findById
      .calledWith(id)
      .mockResolvedValue(serviceOrder);

    const result = await findServiceOrderByIdUseCase.execute({ id });

    expect(result).toEqual(serviceOrder);
    expect(serviceOrderRepository.findById).toHaveBeenCalledWith(id);
  });

  test('should throw NotFoundError if service order is not found', async () => {
    const id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';

    serviceOrderRepository.findById.calledWith(id).mockResolvedValue(null);

    await expect(findServiceOrderByIdUseCase.execute({ id })).rejects.toThrow(
      'Service order not found',
    );
    expect(serviceOrderRepository.findById).toHaveBeenCalledWith(id);
  });
});
