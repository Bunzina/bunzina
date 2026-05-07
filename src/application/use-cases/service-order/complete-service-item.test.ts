import { mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { makeServiceItem } from '@/test/factories/make-service-item';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import type { ServiceItem } from '@/domain/service-order/entities/service-item';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { CompleteServiceItemUseCase } from './complete-service-item';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';

describe('complete service item use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let useCase: CompleteServiceItemUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    useCase = new CompleteServiceItemUseCase(serviceOrderRepository);
  });

  test('should complete an existing service item', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');

    serviceOrderRepository.findServiceItemById.mockResolvedValue(
      makeServiceItem({
        id,
        serviceId: 'svc-1',
        createdAt,
        updatedAt: createdAt,
        description: 'Service',
        isCompleted: false,
      }),
    );

    serviceOrderRepository.findByServiceItemId.mockResolvedValue(
      makeServiceOrder({
        id: 'so-1',
        status: ServiceOrderStatus.IN_EXECUTION,
      }),
    );

    serviceOrderRepository.updateServiceItem.mockImplementation(
      async (item: ServiceItem) => item,
    );
    const result = await useCase.execute({ id });

    expect(result.id).toBe(id);
    expect(result.isCompleted).toBe(true);
    expect(result.finishedAt).toBeInstanceOf(Date);
    expect(result.executionTimeMs).toBeTypeOf('number');
    expect(result.executionTimeMs).toBeGreaterThanOrEqual(0);
    expect(serviceOrderRepository.updateServiceItem).toHaveBeenCalledTimes(1);
  });

  test('should throw NotFoundError when item does not exist', async () => {
    serviceOrderRepository.findServiceItemById.mockResolvedValue(null);

    await expect(useCase.execute({ id: 'missing-id' })).rejects.toThrow();
  });

  test('should throw BadRequestError when item is already completed', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';

    serviceOrderRepository.findServiceItemById.mockResolvedValue(
      makeServiceItem({ id, isCompleted: true }),
    );

    await expect(useCase.execute({ id })).rejects.toThrow();
  });

  test('should throw ForbiddenError when service order is not in execution', async () => {
    const id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

    serviceOrderRepository.findServiceItemById.mockResolvedValue(
      makeServiceItem({ id, isCompleted: false }),
    );

    serviceOrderRepository.findByServiceItemId.mockResolvedValue(
      makeServiceOrder({
        id: 'so-2',
        status: ServiceOrderStatus.IN_DIAGNOSTIC,
      }),
    );

    await expect(useCase.execute({ id })).rejects.toThrow();
  });

  test('should throw NotFoundError when parent service order is not found', async () => {
    const id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';

    serviceOrderRepository.findServiceItemById.mockResolvedValue(
      makeServiceItem({ id, isCompleted: false }),
    );

    serviceOrderRepository.findByServiceItemId.mockResolvedValue(null);

    await expect(useCase.execute({ id })).rejects.toThrow();
  });
});
