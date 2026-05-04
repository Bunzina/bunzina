import type { UpdateServiceOrderInput } from '@/adapters/input/service-order/validations/update-service-order-schema';
import type { FindAutoPartByIdUseCase } from '@/application/use-cases/auto-part/find-by-id';
import type { FindServiceByIdUseCase } from '@/application/use-cases/service/find-by-id';
import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { Price } from '@/domain/core/value-objects/price';
import { AutoPartItem } from '@/domain/service-order/entities/auto-part-item';
import { ServiceItem } from '@/domain/service-order/entities/service-item';
import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { Quote } from '@/domain/service-order/value-objects/quote';
import { BadRequestError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

export class UpdateServiceOrderUseCase {
  constructor(
    private serviceOrderRepository: ServiceOrderRepository,
    private findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
    private findServiceByIdUseCase: FindServiceByIdUseCase,
    private findAutoPartByIdUseCase: FindAutoPartByIdUseCase,
  ) {}

  async execute(input: UpdateServiceOrderInput): Promise<ServiceOrder> {
    const existingServiceOrder = await this.findServiceOrderByIdUseCase.execute(
      { id: input.id },
    );

    const allowedStatuses = new Set<ServiceOrderStatus>([
      ServiceOrderStatus.RECEIVED,
      ServiceOrderStatus.IN_DIAGNOSTIC,
    ]);

    if (!allowedStatuses.has(existingServiceOrder.status)) {
      const message = 'Service order cannot be updated in current status';

      logger.warn({
        message,
        data: { id: input.id, status: existingServiceOrder.status },
      });

      throw new BadRequestError(message);
    }

    const serviceIds = new Set(
      (input.serviceItems ?? []).map((item) => item.serviceId),
    );

    for (const serviceId of serviceIds) {
      await this.findServiceByIdUseCase.execute({ id: serviceId });
    }

    const autoPartIds = new Set(
      (input.autoPartItems ?? []).map((item) => item.autoPartId),
    );

    for (const autoPartId of autoPartIds) {
      await this.findAutoPartByIdUseCase.execute({ id: autoPartId });
    }

    const serviceItems = (input.serviceItems ?? []).map(
      (item) =>
        new ServiceItem({
          serviceId: item.serviceId,
          price: new Price(item.price),
          description: item.description,
        }),
    );

    const autoPartItems = (input.autoPartItems ?? []).map((item) => {
      const unitPrice = new Price(item.unitPrice);
      const totalPrice = new Price(unitPrice.value * item.quantity);

      return new AutoPartItem({
        autoPartId: item.autoPartId,
        quantity: item.quantity,
        unitPrice,
        totalPrice,
        description: item.description,
      });
    });

    const servicesTotal = serviceItems.reduce(
      (total, item) => total + item.price.value,
      0,
    );
    const autoPartsTotal = autoPartItems.reduce(
      (total, item) => total + (item.totalPrice?.value ?? 0),
      0,
    );

    const quote = new Quote({
      servicesTotal,
      autoPartsTotal,
    });

    const updatedServiceOrder = new ServiceOrder({
      id: existingServiceOrder.id,
      customerId: existingServiceOrder.customerId,
      vehicleId: existingServiceOrder.vehicleId,
      status: existingServiceOrder.status,
      serviceItems,
      autoPartItems,
      quote,
      createdAt: existingServiceOrder.createdAt,
      updatedAt: new Date(),
      approvedAt: existingServiceOrder.approvedAt,
      startedAt: existingServiceOrder.startedAt,
      completedAt: existingServiceOrder.completedAt,
      deliveredAt: existingServiceOrder.deliveredAt,
    });

    logger.debug({
      message: 'Updating service order',
      data: updatedServiceOrder,
    });

    await this.serviceOrderRepository.update(updatedServiceOrder);

    return updatedServiceOrder;
  }
}
