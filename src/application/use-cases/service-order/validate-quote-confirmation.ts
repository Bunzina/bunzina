import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { ForbiddenError, NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import type { FindServiceOrderByIdUseCase } from './find-by-id';
import type { FindCustomerByIdUseCase } from '../customer/find-by-id';
import type { Document } from '@/domain/core/value-objects/document';

export class ValidateQuoteConfirmationUseCase {
  constructor(
    private serviceOrderRepository: ServiceOrderRepository,
    private findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
    private findCustomerByIdUseCase: FindCustomerByIdUseCase,
  ) {}

  async execute(input: {
    id: string;
    customerRequesterDocument: Document;
    isConfirmed: boolean;
  }): Promise<ServiceOrder> {
    const serviceOrder = await this.findServiceOrderByIdUseCase.execute({
      id: input.id,
    });

    const customerOwnerOfServiceOrder =
      await this.findCustomerByIdUseCase.execute({
        id: serviceOrder.customerId,
      });

    if (
      !input.customerRequesterDocument.isEqual(
        customerOwnerOfServiceOrder.document,
      )
    ) {
      logger.warn({
        message: 'Customer is not the owner of the Service Order',
      });

      throw new NotFoundError('Service Order not found');
    }

    if (serviceOrder.status !== ServiceOrderStatus.AWAITING_APPROVAL) {
      const message =
        'Service order must be awaiting for approval to settle quote approval';

      logger.warn({
        message,
        data: { id: input.id },
      });

      throw new ForbiddenError(message);
    }

    const targetStatus = input.isConfirmed
      ? ServiceOrderStatus.IN_EXECUTION
      : ServiceOrderStatus.RECEIVED;

    logger.debug({
      message: 'Service order updated',
      data: {
        id: input.id,
        targetStatus,
        isConfirmed: input.isConfirmed,
      },
    });

    const updatedServiceOrder = new ServiceOrder({
      id: serviceOrder.id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: targetStatus,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt: serviceOrder.createdAt,
      updatedAt: new Date(),
      approvedAt: serviceOrder.approvedAt,
      startedAt: input.isConfirmed ? new Date() : undefined,
    });

    await this.serviceOrderRepository.update(updatedServiceOrder);

    return updatedServiceOrder;
  }
}
