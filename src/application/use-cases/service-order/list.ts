import type { ServiceOrder } from '@/domain/service-order/entities/service-order';
import type { FindServiceOrdersParams } from '@/domain/service-order/repositories/service-order-repository';
import type { ServiceOrderRepository } from '@/domain/service-order/repositories/service-order-repository';
import logger from '@lucas-pmelo/logger';

export interface ListServiceOrdersInput extends FindServiceOrdersParams {}

export interface ListServiceOrdersOutput {
  data: ServiceOrder[];
}

export class ListServiceOrdersUseCase {
  constructor(private serviceOrderRepository: ServiceOrderRepository) {}

  async execute(
    input: ListServiceOrdersInput,
  ): Promise<ListServiceOrdersOutput> {
    logger.info({
      message: 'Listing service orders',
      data: input,
    });

    const data = await this.serviceOrderRepository.findByParams(input);

    return {
      data,
    };
  }
}
