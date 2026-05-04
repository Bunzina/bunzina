import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { NotFoundError } from '@lucas-pmelo/handlers';
import { mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { DeleteServiceOrderUseCase } from './delete';

describe('delete service order use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let findServiceOrderByIdUseCase: MockProxy<FindServiceOrderByIdUseCase>;
  let deleteServiceOrderUseCase: DeleteServiceOrderUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    findServiceOrderByIdUseCase = mock();
    deleteServiceOrderUseCase = new DeleteServiceOrderUseCase(
      serviceOrderRepository,
      findServiceOrderByIdUseCase,
    );
  });

  test('should hard delete when status is RECEIVED', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.RECEIVED,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    await deleteServiceOrderUseCase.execute({ id });

    expect(serviceOrderRepository.delete).toHaveBeenCalledWith(id);
    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should hard delete when status is IN_DIAGNOSTIC', async () => {
    const id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.IN_DIAGNOSTIC,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    await deleteServiceOrderUseCase.execute({ id });

    expect(serviceOrderRepository.delete).toHaveBeenCalledWith(id);
    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should soft delete by canceling in other statuses', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      createdAt,
      updatedAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    await deleteServiceOrderUseCase.execute({ id });

    expect(serviceOrderRepository.delete).not.toHaveBeenCalled();
    expect(serviceOrderRepository.update).toHaveBeenCalledTimes(1);
    expect(serviceOrderRepository.update).toHaveBeenNthCalledWith(1, {
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.CANCELED,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt: serviceOrder.startedAt,
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
    });
  });

  test('should throw NotFoundError when service order does not exist', async () => {
    const id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

    findServiceOrderByIdUseCase.execute.mockRejectedValue(
      new NotFoundError('Service order not found'),
    );

    await expect(deleteServiceOrderUseCase.execute({ id })).rejects.toThrow(
      NotFoundError,
    );

    expect(serviceOrderRepository.delete).not.toHaveBeenCalled();
    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });
});
