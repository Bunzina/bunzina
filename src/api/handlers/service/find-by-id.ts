import { FindServiceByIdUseCase } from '@/application/use-cases/service/find-by-id';
import { ServiceRepository } from '@/infrastructure/repositories/service/service-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';
import { FindServiceByIdInput } from '@/adapters/input/service/find-by-id';
import { db as dbInstance } from '@/infrastructure/configs/database';

let serviceRepository: ServiceRepository;
let findServiceByIdUseCase: FindServiceByIdUseCase;
let findServiceByIdInput: FindServiceByIdInput;

const setDependencies = () => {
  serviceRepository = new ServiceRepository(dbInstance);
  findServiceByIdUseCase = new FindServiceByIdUseCase(serviceRepository);
  findServiceByIdInput = new FindServiceByIdInput(findServiceByIdUseCase);
};

export const findServiceByIdHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findServiceByIdInput.execute(context);
};
