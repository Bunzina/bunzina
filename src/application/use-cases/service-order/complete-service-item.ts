import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} from '@lucas-pmelo/handlers';
import { ServiceItem } from '@/domain/service-order/entities/service-item';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import logger from '@lucas-pmelo/logger';

export interface CompleteServiceItemInput {
  id: string;
}

export class CompleteServiceItemUseCase {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async execute(input: CompleteServiceItemInput) {
    const now = new Date();

    const existingServiceItem =
      await this.serviceOrderRepository.findServiceItemById(input.id);

    if (!existingServiceItem) {
      const message = 'Service item not found';
      logger.warn({
        message,
        data: {
          serviceItemId: input.id,
        },
      });

      throw new NotFoundError(message);
    }

    if (existingServiceItem.isCompleted) {
      const message = 'Service item already completed';
      logger.warn({
        message,
        data: { serviceItemId: input.id },
      });

      throw new BadRequestError(message);
    }

    const serviceOrder = await this.serviceOrderRepository.findByServiceItemId(
      input.id,
    );

    if (!serviceOrder) {
      const message = 'Service order not found';
      logger.warn({
        message,
        data: {
          serviceItemId: input.id,
        },
      });

      throw new NotFoundError(message);
    }

    if (serviceOrder.status !== ServiceOrderStatus.IN_EXECUTION) {
      throw new ForbiddenError('Service order is not in execution');
    }

    const executionTimeMs = existingServiceItem.createdAt
      ? now.getTime() - new Date(existingServiceItem.createdAt).getTime()
      : undefined;

    const updatedServiceItem = new ServiceItem({
      id: existingServiceItem.id,
      serviceId: existingServiceItem.serviceId,
      price: existingServiceItem.price,
      description: existingServiceItem.description,
      createdAt: existingServiceItem.createdAt,
      updatedAt: now,
      isCompleted: true,
      finishedAt: now,
      executionTimeMs,
    });

    await this.serviceOrderRepository.updateServiceItem(
      updatedServiceItem,
      serviceOrder.id!,
    );

    return updatedServiceItem;
  }
}
