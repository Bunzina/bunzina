import { ListServicesInput } from '@/adapters/input/service/list';
import type { HandlerContext } from '@/api/handler-context';
import { ListServicesUseCase } from '@/application/use-cases/service/list';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { ServiceRepository } from '@/infrastructure/repositories/service/service-repository';
import logger from '@lucas-pmelo/logger';

let serviceRepository: ServiceRepository;
let listServicesUseCase: ListServicesUseCase;
let listServicesInput: ListServicesInput;

const setDependencies = () => {
  serviceRepository = new ServiceRepository(dbInstance);
  listServicesUseCase = new ListServicesUseCase(serviceRepository);
  listServicesInput = new ListServicesInput(listServicesUseCase);
};

export const listServicesHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await listServicesInput.execute(context);
};
