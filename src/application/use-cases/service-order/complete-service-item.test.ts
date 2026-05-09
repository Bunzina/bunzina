import { mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { makeServiceItem } from '@/test/factories/make-service-item';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import type { ServiceRepository } from '@/domain/service/repositories/service-repository';
import { CompleteServiceItemUseCase } from './complete-service-item';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';

describe('complete service item use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let serviceRepository: MockProxy<ServiceRepository>;
  let useCase: CompleteServiceItemUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    serviceRepository = mock();
    useCase = new CompleteServiceItemUseCase(
      serviceOrderRepository,
      serviceRepository,
    );
  });

  test('should complete an existing service item and increment execution stats', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const serviceId = 'svc-1';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');

    serviceOrderRepository.findServiceItemById.calledWith(id).mockResolvedValue(
      makeServiceItem({
        id,
        serviceId,
        createdAt,
        updatedAt: createdAt,
        description: 'Service',
        isCompleted: false,
      }),
    );

    serviceOrderRepository.findByServiceItemId.calledWith(id).mockResolvedValue(
      makeServiceOrder({
        id: 'so-1',
        status: ServiceOrderStatus.IN_EXECUTION,
      }),
    );

    const result = await useCase.execute({ id });

    expect(result.id).toEqual(id);
    expect(result.isCompleted).toEqual(true);
    expect(result.finishedAt).toBeInstanceOf(Date);
    expect(result.executionTimeMs).toBeTypeOf('number');
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(serviceOrderRepository.updateServiceItem).toHaveBeenCalledTimes(1);
    expect(serviceRepository.incrementExecutionStats).toHaveBeenCalledTimes(1);
    expect(serviceRepository.incrementExecutionStats).toHaveBeenCalledWith(
      serviceId,
      expect.any(Number),
    );
  });

  test('should throw NotFoundError when item does not exist', async () => {
    serviceOrderRepository.findServiceItemById
      .calledWith('missing-id')
      .mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id' })).rejects.toThrow();
    expect(serviceRepository.incrementExecutionStats).not.toHaveBeenCalled();
  });

  test('should throw BadRequestError when item is already completed', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

    serviceOrderRepository.findServiceItemById
      .calledWith(id)
      .mockResolvedValue(makeServiceItem({ id, isCompleted: true }));

    await expect(useCase.execute({ id })).rejects.toThrow();
    expect(serviceRepository.incrementExecutionStats).not.toHaveBeenCalled();
  });

  test('should throw ForbiddenError when service order is not in execution', async () => {
    const id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

    serviceOrderRepository.findServiceItemById
      .calledWith(id)
      .mockResolvedValue(makeServiceItem({ id, isCompleted: false }));

    serviceOrderRepository.findByServiceItemId.calledWith(id).mockResolvedValue(
      makeServiceOrder({
        id: 'so-2',
        status: ServiceOrderStatus.IN_DIAGNOSTIC,
      }),
    );

    await expect(useCase.execute({ id })).rejects.toThrow();
    expect(serviceRepository.incrementExecutionStats).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when parent service order is not found', async () => {
    const id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

    serviceOrderRepository.findServiceItemById
      .calledWith(id)
      .mockResolvedValue(makeServiceItem({ id, isCompleted: false }));

    serviceOrderRepository.findByServiceItemId
      .calledWith(id)
      .mockResolvedValue(null);

    await expect(useCase.execute({ id })).rejects.toThrow();
    expect(serviceRepository.incrementExecutionStats).not.toHaveBeenCalled();
  });
});
