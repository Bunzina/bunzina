import type { CustomerRepository } from '@/domain/customer/repositories/customer-repository';
import type { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import logger from '@lucas-pmelo/logger';

interface Input {
  documentNumber: string;
}

export class FindServiceOrdersByCustomerUseCase {
  constructor(
    private customerRepository: CustomerRepository,
    private serviceOrderRepository: ServiceOrderRepository,
  ) {}

  async execute({ documentNumber }: Input): Promise<ServiceOrder[]> {
    const customer =
      await this.customerRepository.findByDocumentNumber(documentNumber);

    if (!customer) {
      logger.debug({
        message: 'No customer found for service orders lookup',
        data: { documentNumber },
      });

      return [];
    }

    const serviceOrders = await this.serviceOrderRepository.findByParams({
      page: 1,
      limit: Number.MAX_SAFE_INTEGER,
      filters: {
        customerId: customer.id,
      },
    });

    logger.debug({
      message: 'Service orders found for customer',
      data: {
        documentNumber,
        customerId: customer.id,
        count: serviceOrders.length,
      },
    });

    return serviceOrders;
  }
}
