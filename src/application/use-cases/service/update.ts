import type { UpdateServiceHttpInput } from '@/adapters/input/service/validations/update-service-schema';
import { Service } from '@/domain/service/entities/service';
import type { IServiceRepository } from '@/domain/service/repositories/service-repository';
import { NotFoundError } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';

export class UpdateServiceUseCase {
  constructor(private serviceRepository: IServiceRepository) {}

  async execute(input: UpdateServiceHttpInput): Promise<Service> {
    const existingService = await this.serviceRepository.findById(input.id);

    if (!existingService) {
      const message = 'Service not found for update';
      logger.warn({
        message,
        data: { id: input.id },
      });

      throw new NotFoundError(message);
    }

    logger.debug({
      message: 'Updating service',
      data: { ...input },
    });

    const updatedService = new Service({
      id: existingService.id,
      name: input.name ?? existingService.name,
      description: input.description ?? existingService.description,
      price: {
        value: input.price ?? existingService.price.value,
      },
      durationInMinutes:
        input.durationInMinutes ?? existingService.durationInMinutes,
      isActive: input.isActive ?? existingService.isActive,
      createdAt: existingService.createdAt,
      updatedAt: new Date(),
    });

    await this.serviceRepository.update(updatedService);

    return updatedService;
  }
}
