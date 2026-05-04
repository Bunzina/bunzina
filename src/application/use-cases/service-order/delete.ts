import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class DeleteServiceOrderUseCase {
  constructor(
    private serviceOrderRepository: ServiceOrderRepository,
    private findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
  ) {}

  async execute({ id }: Input): Promise<void> {
    const serviceOrder = await this.findServiceOrderByIdUseCase.execute({ id });

    const hardDeleteStatuses = new Set<ServiceOrderStatus>([
      ServiceOrderStatus.RECEIVED,
      ServiceOrderStatus.IN_DIAGNOSTIC,
    ]);

    if (hardDeleteStatuses.has(serviceOrder.status)) {
      logger.debug({
        message: 'Hard deleting service order',
        data: { id, status: serviceOrder.status },
      });

      await this.serviceOrderRepository.delete(id);
      return;
    }

    const canceledServiceOrder = new ServiceOrder({
      id: serviceOrder.id,
      customerId: serviceOrder.customerId,
      vehicleId: serviceOrder.vehicleId,
      status: ServiceOrderStatus.CANCELED,
      serviceItems: serviceOrder.serviceItems,
      autoPartItems: serviceOrder.autoPartItems,
      quote: serviceOrder.quote,
      createdAt: serviceOrder.createdAt,
      updatedAt: new Date(),
      approvedAt: serviceOrder.approvedAt,
      startedAt: serviceOrder.startedAt,
      completedAt: serviceOrder.completedAt,
      deliveredAt: serviceOrder.deliveredAt,
    });

    logger.debug({
      message: 'Soft deleting service order',
      data: { id, status: serviceOrder.status },
    });

    await this.serviceOrderRepository.update(canceledServiceOrder);
  }
}
