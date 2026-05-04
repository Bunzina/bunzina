import type { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class FindServiceOrderByIdUseCase {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async execute({ id }: Input): Promise<ServiceOrder> {
    const serviceOrder = await this.serviceOrderRepository.findById(id);

    if (!serviceOrder) {
      const message = 'Service order not found';

      logger.warn({
        message,
        data: {
          id,
        },
      });

      throw new NotFoundError(message);
    }

    return serviceOrder;
  }
}
