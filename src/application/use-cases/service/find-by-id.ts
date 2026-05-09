import type { Service } from '@/domain/service/entities/service';
import type { ServiceRepository } from '@/domain/service/repositories/service-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

interface Input {
  id: string;
}

export class FindServiceByIdUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute({ id }: Input): Promise<Service> {
    const service = await this.serviceRepository.findById(id);

    if (!service) {
      const message = 'Service not found';

      logger.warn({
        message,
        data: { id },
      });

      throw new NotFoundError(message);
    }

    service.averageExecutionTimeMs = service.completedCount
      ? Math.round(service.totalExecutionTimeMs / service.completedCount)
      : undefined;

    return service;
  }
}
