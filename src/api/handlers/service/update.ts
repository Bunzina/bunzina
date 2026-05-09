import { UpdateServiceInput } from '@/adapters/input/service/update';
import { UpdateServiceUseCase } from '@/application/use-cases/service/update';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { ServiceRepository } from '@/infrastructure/repositories/service/service-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let serviceRepository: ServiceRepository;
let updateServiceUseCase: UpdateServiceUseCase;
let updateServiceInput: UpdateServiceInput;

const setDependencies = () => {
  serviceRepository = new ServiceRepository(dbInstance);
  updateServiceUseCase = new UpdateServiceUseCase(serviceRepository);
  updateServiceInput = new UpdateServiceInput(updateServiceUseCase);
};

export const updateServiceHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateServiceInput.execute(context);
};
