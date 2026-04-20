import type { CreateServiceHttpInput } from '@/adapters/input/service/validations/create-service-schema';
import { Price } from '@/domain/core/value-objects/price';
import { Service } from '@/domain/service/entities/service';
import type { IServiceRepository as ServiceRepository } from '@/domain/service/repositories/service-repository';
import logger from '@lucas-pmelo/logger';

export class CreateServiceUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(input: CreateServiceHttpInput): Promise<Service> {
    const service = new Service({
      name: input.name,
      description: input.description,
      price: new Price(input.price),
      durationInMinutes: input.durationInMinutes,
      isActive: true,
    });

    logger.debug({
      message: 'Creating service',
      data: service,
    });

    await this.serviceRepository.create(service);

    return service;
  }
}
