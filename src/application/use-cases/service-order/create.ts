import type { CreateServiceOrderInput } from '@/adapters/input/service-order/validations/create-service-order-schema';
import type { AutoPartRepository } from '@/domain/auto-part/repositories/auto-part-repository';
import { Price } from '@/domain/core/value-objects/price';
import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import type { IServiceRepository } from '@/domain/service/repositories/service-repository';
import { AutoPartItem } from '@/domain/service-order/entities/auto-part-item';
import { ServiceItem } from '@/domain/service-order/entities/service-item';
import { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { ServiceOrderStatus } from '@/domain/service-order/types/service-order-status';
import { Quote } from '@/domain/service-order/value-objects/quote';
import type { VehicleRepository } from '@/domain/vehicle/repositories/vehicle-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

export class CreateServiceOrderUseCase {
  constructor(
    private serviceOrderRepository: ServiceOrderRepository,
    private customerRepository: CustomerRepository,
    private vehicleRepository: VehicleRepository,
    private serviceRepository: IServiceRepository,
    private autoPartRepository: AutoPartRepository,
  ) {}

  async execute(input: CreateServiceOrderInput): Promise<ServiceOrder> {
    const customer = await this.customerRepository.findById(input.customerId);

    if (!customer) {
      const message = 'Customer not found';

      logger.warn({
        message,
        data: { customerId: input.customerId },
      });

      throw new NotFoundError(message);
    }

    const vehicle = await this.vehicleRepository.findById(input.vehicleId);

    if (!vehicle) {
      const message = 'Vehicle not found';

      logger.warn({
        message,
        data: { vehicleId: input.vehicleId },
      });

      throw new NotFoundError(message);
    }

    const serviceIds = new Set(
      (input.serviceItems ?? []).map((item) => item.serviceId),
    );

    for (const serviceId of serviceIds) {
      const service = await this.serviceRepository.findById(serviceId);

      if (!service) {
        const message = 'Service not found';

        logger.warn({
          message,
          data: { serviceId },
        });

        throw new NotFoundError(message);
      }
    }

    const autoPartIds = new Set(
      (input.autoPartItems ?? []).map((item) => item.autoPartId),
    );

    for (const autoPartId of autoPartIds) {
      const autoPart = await this.autoPartRepository.findById(autoPartId);

      if (!autoPart) {
        const message = 'Auto part not found';

        logger.warn({
          message,
          data: { autoPartId },
        });

        throw new NotFoundError(message);
      }
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
