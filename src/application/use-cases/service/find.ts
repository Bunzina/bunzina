import type { Service } from '@/domain/service/entities/service';
import type { IServiceRepository as ServiceRepository } from '@/domain/service/repositories/service-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
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
      const message = 'Service not found';

      logger.warn({
        message,
        data: { id },
      });

      throw new NotFoundError(message);
    }

    const averageExecutionTimeMs =
      await this.serviceRepository.getAverageExecutionTimeMs(id);
    service.averageExecutionTimeMs = averageExecutionTimeMs;

    return service;
  }
}
