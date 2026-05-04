import type { CreateServiceOrderInput } from '@/adapters/input/service-order/validations/create-service-order-schema';
import type { FindAutoPartByIdUseCase } from '@/application/use-cases/auto-part/find-by-id';
import type { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import type { FindServiceByIdUseCase } from '@/application/use-cases/service/find-by-id';
import type { FindVehicleByIdUseCase } from '@/application/use-cases/vehicle/find-by-id';
import { Price } from '@/domain/core/value-objects/price';
import { AutoPartItem } from '@/domain/service-order/entities/auto-part-item';
import { ServiceItem } from '@/domain/service-order/entities/service-item';
import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { Quote } from '@/domain/service-order/value-objects/quote';
import logger from '@lucas-pmelo/logger';

export class CreateServiceOrderUseCase {
  constructor(
    private serviceOrderRepository: ServiceOrderRepository,
    private findCustomerByIdUseCase: FindCustomerByIdUseCase,
    private findVehicleByIdUseCase: FindVehicleByIdUseCase,
    private findServiceByIdUseCase: FindServiceByIdUseCase,
    private findAutoPartByIdUseCase: FindAutoPartByIdUseCase,
  ) {}

  async execute(input: CreateServiceOrderInput): Promise<ServiceOrder> {
    await this.findCustomerByIdUseCase.execute({ id: input.customerId });
    await this.findVehicleByIdUseCase.execute({ id: input.vehicleId });

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

    const serviceOrder = new ServiceOrder({
      customerId: input.customerId,
      vehicleId: input.vehicleId,
      status: ServiceOrderStatus.RECEIVED,
      serviceItems,
      autoPartItems,
      quote,
    });

    logger.debug({
      message: 'Creating service order',
      data: serviceOrder,
    });

    await this.serviceOrderRepository.create(serviceOrder);

    return serviceOrder;
  }
}
