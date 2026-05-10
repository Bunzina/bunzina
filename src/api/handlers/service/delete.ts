import { DeleteServiceInput } from '@/adapters/input/service/delete';
import { DeleteServiceUseCase } from '@/application/use-cases/service/delete';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { ServiceRepository } from '@/infrastructure/repositories/service/service-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let deleteServiceUseCase: DeleteServiceUseCase;
let serviceRepository: ServiceRepository;
let deleteServiceInput: DeleteServiceInput;

const setDependencies = () => {
  serviceRepository = new ServiceRepository(dbInstance);
  deleteServiceUseCase = new DeleteServiceUseCase(serviceRepository);
  deleteServiceInput = new DeleteServiceInput(deleteServiceUseCase);
};

export const deleteServiceHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await deleteServiceInput.execute(context);
};
