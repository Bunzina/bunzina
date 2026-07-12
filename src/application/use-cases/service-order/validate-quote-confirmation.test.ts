import type { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { Document } from '@/domain/core/value-objects/document';
import { makeCustomer } from '@/test/factories/make-customer';
import { makeServiceOrder } from '@/test/factories/make-service-order';
import { ForbiddenError, NotFoundError } from '@lucas-pmelo/handlers';
import { mock, type MockProxy } from 'bun-mock-extended';
import { beforeEach, describe, expect, mock as bunMock, test } from 'bun:test';

bunMock.module('@lucas-pmelo/logger', () => ({
  default: {
    setEvent: () => {},
    debug: () => {},
    info: () => {},
    warn: () => {},
    error: () => {},
  },
}));

import { ValidateQuoteConfirmationUseCase } from '@/application/use-cases/service-order/validate-quote-confirmation';

describe('validate quote confirmation use case', () => {
  let serviceOrderRepository: MockProxy<ServiceOrderRepository>;
  let findServiceOrderByIdUseCase: MockProxy<FindServiceOrderByIdUseCase>;
  let findCustomerByIdUseCase: MockProxy<FindCustomerByIdUseCase>;
  let validateQuoteConfirmationUseCase: ValidateQuoteConfirmationUseCase;

  beforeEach(() => {
    serviceOrderRepository = mock();
    findServiceOrderByIdUseCase = mock();
    findCustomerByIdUseCase = mock();
    validateQuoteConfirmationUseCase = new ValidateQuoteConfirmationUseCase(
      serviceOrderRepository,
      findServiceOrderByIdUseCase,
      findCustomerByIdUseCase,
    );
  });

  test('should confirm quote and move service order to IN_EXECUTION', async () => {
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
    findCustomerByIdUseCase.execute.mockResolvedValue(makeCustomer());
    serviceOrderRepository.update.mockResolvedValue(undefined);

    const result = await validateQuoteConfirmationUseCase.execute({
      id,
      customerRequesterDocument: new Document('123.456.789-09'),
      isConfirmed: true,
    });

    expect(findServiceOrderByIdUseCase.execute).toHaveBeenCalledWith({ id });
    expect(findCustomerByIdUseCase.execute).toHaveBeenCalledWith({
      id: serviceOrder.customerId,
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

  test('should return service order to RECEIVED when quote is not confirmed', async () => {
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
    findCustomerByIdUseCase.execute.mockResolvedValue(makeCustomer());
    serviceOrderRepository.update.mockResolvedValue(undefined);

    const result = await validateQuoteConfirmationUseCase.execute({
      id,
      customerRequesterDocument: new Document('123.456.789-09'),
      isConfirmed: false,
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
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
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
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
    });
  });

  test('should throw NotFoundError when requester is not the owner', async () => {
    const id = 'cccccccc-cccc-4ccc-8ccc-cccccccccccc';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.AWAITING_APPROVAL,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);
    findCustomerByIdUseCase.execute.mockResolvedValue(
      makeCustomer({ document: new Document('98765432100') }),
    );

    await expect(
      validateQuoteConfirmationUseCase.execute({
        id,
        customerRequesterDocument: new Document('123.456.789-09'),
        isConfirmed: true,
      }),
    ).rejects.toThrow(NotFoundError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });

  test('should throw ForbiddenError when service order is not awaiting approval', async () => {
    const id = 'dddddddd-dddd-4ddd-8ddd-dddddddddddd';
    const serviceOrder = makeServiceOrder({
      id,
      status: ServiceOrderStatus.RECEIVED,
    });

    findServiceOrderByIdUseCase.execute.mockResolvedValue(serviceOrder);
    findCustomerByIdUseCase.execute.mockResolvedValue(makeCustomer());

    await expect(
      validateQuoteConfirmationUseCase.execute({
        id,
        customerRequesterDocument: new Document('123.456.789-09'),
        isConfirmed: true,
      }),
    ).rejects.toThrow(ForbiddenError);

    expect(serviceOrderRepository.update).not.toHaveBeenCalled();
  });
});
