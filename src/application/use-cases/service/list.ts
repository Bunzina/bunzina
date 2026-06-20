import type { Service } from '@/domain/service/entities/service';
import type {
  FindServicesParams,
  ServiceRepository,
} from '@/domain/service/repositories/service-repository';
import logger from '@lucas-pmelo/logger';

export interface ListServicesInput extends FindServicesParams {}

export interface ListServicesOutput {
  data: Service[];
}

export class ListServicesUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(input: ListServicesInput): Promise<ListServicesOutput> {
    logger.info({
      message: 'Listing services',
      data: input,
    });

    const data = await this.serviceRepository.findByParams(input);

    return {
      data,
    };
  }
}
