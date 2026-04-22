import type { Service } from '@/domain/service/entities/service';
import type { IServiceRepository as ServiceRepository } from '@/domain/service/repositories/service-repository';
import logger from '@lucas-pmelo/logger';

export class FindServiceUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(id: string): Promise<Service> {
    const service = await this.serviceRepository.findById(id);

    logger.debug({
      message: 'Finding service by id',
      data: { id },
    });

    if (!service) {
      logger.warn({
        message: 'Service not found',
        data: { id },
      });

      throw new Error('Service not found');
    }

    return service;
  }
}
