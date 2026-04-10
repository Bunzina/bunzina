import { CreateServiceInput } from '@/adapters/input/service/create';
import { CreateServiceUseCase } from '@/application/use-cases/service/create';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { ServiceRepository } from '@/infrastructure/repositories/service/service-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let createServiceUseCase: CreateServiceUseCase;
let serviceRepository: ServiceRepository;
let createServiceInput: CreateServiceInput;

const setDependencies = () => {
  serviceRepository = new ServiceRepository(dbInstance);
  createServiceUseCase = new CreateServiceUseCase(serviceRepository);
  createServiceInput = new CreateServiceInput(createServiceUseCase);
};

export const createServiceHandler = async (
  context: Context,
): Promise<Response | undefined> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createServiceInput.execute(context);
};
