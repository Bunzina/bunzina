import type { UpdateServiceOrderStatusInput } from '@/adapters/input/service-order/validations/update-service-order-status-schema';
import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import {
  determineStatusTransition,
  StatusDirection,
} from '@/domain/service-order/state-machines/status-machine';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { ForbiddenError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import type { FindServiceOrderByIdUseCase } from './find-by-id';
import type { NotificationService } from '@/domain/notification/services/notification';
import type { FindCustomerByIdUseCase } from '../customer/find-by-id';

export class UpdateServiceOrderStatusUseCase {
  constructor(
    private serviceOrderRepository: ServiceOrderRepository,
    private findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
    private findCustomerByIdUseCase: FindCustomerByIdUseCase,
    private notificationService: NotificationService,
  ) {}

  async execute(input: UpdateServiceOrderStatusInput): Promise<ServiceOrder> {
    const serviceOrder = await this.findServiceOrderByIdUseCase.execute({
      id: input.id,
    });

    const targetStatus = determineStatusTransition(
      serviceOrder.status,
      input.direction,
    );

    if (!targetStatus) {
      const message = `Service order status cannot move ${input.direction}`;

      logger.warn({
        message,
        data: { id: input.id, status: serviceOrder.status },
      });

      throw new ForbiddenError(message);
    }

    if (targetStatus === ServiceOrderStatus.AWAITING_APPROVAL) {
      const customer = await this.findCustomerByIdUseCase.execute({
        id: serviceOrder.customerId,
      });

      await this.notificationService.sendEmail({
        message: `Segue orçamento da Ordem de Serviço para validação: 
        Total em peças: R$${Number(serviceOrder.quote.autoPartsTotal)},00 
        Total em serviço: R$${Number(serviceOrder.quote.servicesTotal)},00 
        Total: R$${Number(serviceOrder.quote.total)},00`,
        to: customer.email.value,
        subject: 'Orçamento de Ordem de Serviço',
      });
    }
    if (targetStatus === ServiceOrderStatus.COMPLETED) {
      const allCompleted = serviceOrder.serviceItems.every(
        (item) => item.isCompleted === true,
      );

      if (!allCompleted) {
        const message =
          'All service items must be completed before closing the service order';

        logger.warn({
          message,
          data: { id: input.id },
        });

        throw new ForbiddenError(message);
      }
    }

    const { startedAt, completedAt, deliveredAt } = this.resolveTimestamps(
      input.direction,
      targetStatus,
      serviceOrder,
    );

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
      startedAt,
      completedAt,
      deliveredAt,
    });

    logger.debug({
      message: 'Moving service order status',
      data: {
        id: input.id,
        from: serviceOrder.status,
        to: targetStatus,
        direction: input.direction,
      },
    });

    await this.serviceOrderRepository.update(updatedServiceOrder);

    return updatedServiceOrder;
  }

  private resolveTimestamps(
    direction: StatusDirection,
    targetStatus: ServiceOrderStatus,
    serviceOrder: ServiceOrder,
  ): {
    startedAt?: Date;
    completedAt?: Date;
    deliveredAt?: Date;
  } {
    if (direction === StatusDirection.BACK) {
      return {
        startedAt: undefined,
        completedAt: undefined,
        deliveredAt: undefined,
      };
    }

    return {
      startedAt:
        targetStatus === ServiceOrderStatus.IN_EXECUTION
          ? new Date()
          : serviceOrder.startedAt,
      completedAt:
        targetStatus === ServiceOrderStatus.COMPLETED
          ? new Date()
          : serviceOrder.completedAt,
      deliveredAt:
        targetStatus === ServiceOrderStatus.DELIVERED
          ? new Date()
          : serviceOrder.deliveredAt,
    };
  }
}
