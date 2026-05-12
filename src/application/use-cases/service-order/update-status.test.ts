import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import type { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import type { NotificationService } from '@/domain/notification/services/notification';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { makeServiceItem } from '@/test/factories/make-service-item';
import { makeCustomer } from '@/test/factories/make-customer';
import { ForbiddenError, NotFoundError } from '@lucas-pmelo/handlers';
import { mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, test } from 'bun:test';
import { UpdateServiceOrderStatusUseCase } from './update-status';
import { StatusDirection } from '@/domain/service-order/state-machines/status-machine';
import { makeEmail } from '@/test/factories/make-email';

describe('update service order status use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let findServiceOrderByIdUseCase: MockProxy<FindServiceOrderByIdUseCase>;
  let findCustomerByIdUseCase: MockProxy<FindCustomerByIdUseCase>;
  let notificationService: MockProxy<NotificationService>;
  let updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    findServiceOrderByIdUseCase = mock();
    findCustomerByIdUseCase = mock();
    notificationService = mock();
    updateServiceOrderStatusUseCase = new UpdateServiceOrderStatusUseCase(
      serviceOrderRepository,
      findServiceOrderByIdUseCase,
      findCustomerByIdUseCase,
      notificationService,
    );
  });

  test('should set startedAt when moving to IN_EXECUTION', async () => {
    const id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
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

  test('should clear timestamps when moving back to RECEIVED', async () => {
    const id = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
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

  test('should throw ForbiddenError when transition is invalid', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
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

  test('should throw ForbiddenError when completing order with incomplete service items', async () => {
    const id = 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.IN_EXECUTION,
      serviceItems: [
        makeServiceItem({
          isCompleted: false,
        }),
      ],
    });

    if (serviceOrder.serviceItems.length === 0) {
      throw new Error('factory must create at least one service item');
    }

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    await expect(
      updateServiceOrderStatusUseCase.execute({
        id,
        direction: StatusDirection.NEXT,
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should throw NotFoundError when service order does not exist', async () => {
    const id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';

    findServiceOrderByIdUseCase.execute.mockRejectedValue(
      new NotFoundError('Service order not found'),
    );

    await expect(
      updateServiceOrderStatusUseCase.execute({ id, direction: 'next' }),
    ).rejects.toThrow(NotFoundError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should send email to customer when moving to AWAITING_APPROVAL', async () => {
    const id = 'ffffffff-ffff-4fff-8fff-ffffffffffff';
    const customerId = 'customer-id-123';
    const customerEmail = 'customer@bunzina.com';
    const serviceOrder = makeServiceOrder({
      id,
      customerId,
      status: ServiceOrderStatus.IN_DIAGNOSTIC,
    });
    const customer = makeCustomer({
      id: customerId,
      email: makeEmail(customerEmail),
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);
    findCustomerByIdUseCase.execute.mockResolvedValue(customer);
    notificationService.sendEmail.mockResolvedValue(undefined);

    const result = await updateServiceOrderStatusUseCase.execute({
      id,
      direction: StatusDirection.NEXT,
    });

    expect(findCustomerByIdUseCase.execute).toHaveBeenNthCalledWith(1, {
      id: customerId,
    });
    expect(notificationService.sendEmail).toHaveBeenNthCalledWith(1, {
      message: `Segue orçamento da Ordem de Serviço para validação: 
        Total em peças: R$200,00 
        Total em serviço: R$300,00 
        Total: R$500,00`,
      to: customerEmail,
      subject: 'Orçamento de Ordem de Serviço',
    });
    expect(result.status).toBe(ServiceOrderStatus.AWAITING_APPROVAL);
  });

  test('should not send email when moving to other statuses', async () => {
    const id = '11111111-1111-4111-8111-111111111111';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.AWAITING_APPROVAL,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);

    await updateServiceOrderStatusUseCase.execute({
      id,
      direction: StatusDirection.NEXT,
    });

    expect(findCustomerByIdUseCase.execute).not.toHaveBeenCalled();
    expect(notificationService.sendEmail).not.toHaveBeenCalled();
  });
});
