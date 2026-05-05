import type { UpdateServiceOrderStatusInput } from '@/adapters/input/service-order/validations/update-service-order-status-schema';
import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import {
  determineStatusTransition,
  type StatusDirection,
} from '@/domain/service-order/state-machines/status-machine';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { ForbiddenError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import type { FindServiceOrderByIdUseCase } from './find-by-id';

type Direction = StatusDirection;

export class UpdateServiceOrderStatusUseCase {
  constructor(
    private serviceOrderRepository: ServiceOrderRepository,
    private findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
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
    direction: Direction,
    targetStatus: ServiceOrderStatus,
    serviceOrder: ServiceOrder,
  ): {
    startedAt?: Date;
    completedAt?: Date;
    deliveredAt?: Date;
  } {
    if (direction === 'back') {
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
