import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { ForbiddenError, NotFoundError } from '@lucas-pmelo/handlers';
import { mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { UpdateServiceOrderStatusUseCase } from './update-status';

describe('update service order status use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let findServiceOrderByIdUseCase: MockProxy<FindServiceOrderByIdUseCase>;
  let updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    findServiceOrderByIdUseCase = mock();
    updateServiceOrderStatusUseCase = new UpdateServiceOrderStatusUseCase(
      serviceOrderRepository,
      findServiceOrderByIdUseCase,
    );
  });

  test('should move from RECEIVED to IN_DIAGNOSTIC on next', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.RECEIVED,
      createdAt,
      updatedAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    const result = await updateServiceOrderStatusUseCase.execute({
      id,
      direction: 'next',
    });

    expect(serviceOrderRepository.update).toHaveBeenNthCalledWith(1, {
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.IN_DIAGNOSTIC,
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
    expect(result).toEqual({
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.IN_DIAGNOSTIC,
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

  test('should move from AWAITING_APPROVAL to IN_EXECUTION on next and set startedAt', async () => {
    const id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      createdAt,
      updatedAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    const result = await updateServiceOrderStatusUseCase.execute({
      id,
      direction: 'next',
    });

    expect(serviceOrderRepository.update).toHaveBeenNthCalledWith(1, {
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.IN_EXECUTION,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt: expect.any(Date),
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
    });
    expect(result).toEqual({
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.IN_EXECUTION,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt: expect.any(Date),
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
    });
  });

  test('should move from IN_EXECUTION to COMPLETED on next and set completedAt', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');
    const startedAt = new Date('2026-04-03T10:00:00.000Z');
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.IN_EXECUTION,
      createdAt,
      updatedAt,
      startedAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    const result = await updateServiceOrderStatusUseCase.execute({
      id,
      direction: 'next',
    });

    expect(serviceOrderRepository.update).toHaveBeenNthCalledWith(1, {
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.COMPLETED,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt,
      completedAt: expect.any(Date),
      deliveredAt: serviceOrder.deliveredAt,
    });
    expect(result).toEqual({
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.COMPLETED,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt,
      completedAt: expect.any(Date),
      deliveredAt: serviceOrder.deliveredAt,
    });
  });

  test('should move from COMPLETED to DELIVERED on next and set deliveredAt', async () => {
    const id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');
    const startedAt = new Date('2026-04-03T10:00:00.000Z');
    const completedAt = new Date('2026-04-04T10:00:00.000Z');
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.COMPLETED,
      createdAt,
      updatedAt,
      startedAt,
      completedAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    const result = await updateServiceOrderStatusUseCase.execute({
      id,
      direction: 'next',
    });

    expect(serviceOrderRepository.update).toHaveBeenNthCalledWith(1, {
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.DELIVERED,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt,
      completedAt,
      deliveredAt: expect.any(Date),
    });
    expect(result).toEqual({
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.DELIVERED,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt,
      completedAt,
      deliveredAt: expect.any(Date),
    });
  });

  test('should move back from AWAITING_APPROVAL to RECEIVED and clear timestamps', async () => {
    const id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    const createdAt = new Date('2026-04-01T10:00:00.000Z');
    const updatedAt = new Date('2026-04-02T10:00:00.000Z');
    const startedAt = new Date('2026-04-03T10:00:00.000Z');
    const completedAt = new Date('2026-04-04T10:00:00.000Z');
    const deliveredAt = new Date('2026-04-05T10:00:00.000Z');
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.AWAITING_APPROVAL,
      createdAt,
      updatedAt,
      startedAt,
      completedAt,
      deliveredAt,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    const result = await updateServiceOrderStatusUseCase.execute({
      id,
      direction: 'back',
    });

    expect(serviceOrderRepository.update).toHaveBeenNthCalledWith(1, {
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt: undefined,
      completedAt: undefined,
      deliveredAt: undefined,
    });
    expect(result).toEqual({
      id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.RECEIVED,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt,
      updatedAt: expect.any(Date),
      approvedAt: serviceOrder.approvedAt,
      startedAt: undefined,
      completedAt: undefined,
      deliveredAt: undefined,
    });
  });

  test('should throw ForbiddenError when back is requested outside AWAITING_APPROVAL', async () => {
    const id = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.RECEIVED,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    await expect(
      updateServiceOrderStatusUseCase.execute({
        id,
        direction: 'back',
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should throw ForbiddenError when next is requested from DELIVERED', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.DELIVERED,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    await expect(
      updateServiceOrderStatusUseCase.execute({
        id,
        direction: 'next',
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when service order does not exist', async () => {
    const id = '22222222-2222-4222-8222-222222222222';

    findServiceOrderByIdUseCase.execute.mockRejectedValue(
      new NotFoundError('Service order not found'),
    );

    await expect(
      updateServiceOrderStatusUseCase.execute({ id, direction: 'next' }),
    ).rejects.toThrow(NotFoundError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });
});
