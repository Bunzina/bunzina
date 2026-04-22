import type { DeleteServiceHttpInput } from '@/adapters/input/service/validations/delete-service-schema';
import type { IServiceRepository as ServiceRepository } from '@/domain/service/repositories/service-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

export class DeleteServiceUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute({ id }: DeleteServiceHttpInput): Promise<void> {
    const service = await this.serviceRepository.findById(id);

    if (!service) {
      const message = 'Service not found';

      logger.warn({
        message,
        serviceId: id,
      });

      throw new NotFoundError(message);
    }

    logger.debug({
      message: 'Deleting service',
      serviceId: id,
    });

    await this.serviceRepository.delete(id);
  }
}
