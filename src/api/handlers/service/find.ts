import { FindServiceUseCase } from '@/application/use-cases/service/find';
import { ServiceRepository } from '@/infrastructure/repositories/service/service-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

import { FindServiceInput } from '@/adapters/input/service/find';
import { db as dbInstance } from '@/infrastructure/configs/database';

let serviceRepository: ServiceRepository;
let findServiceUseCase: FindServiceUseCase;
let findServiceInput: FindServiceInput;

const setDependencies = () => {
  serviceRepository = new ServiceRepository(dbInstance);
  findServiceUseCase = new FindServiceUseCase(serviceRepository);
  findServiceInput = new FindServiceInput(findServiceUseCase);
};

export const findServiceHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findServiceInput.execute(context);
};
