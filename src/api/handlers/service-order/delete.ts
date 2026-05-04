import { DeleteServiceOrderInput } from '@/adapters/input/service-order/delete';
import { DeleteServiceOrderUseCase } from '@/application/use-cases/service-order/delete';
import { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let serviceOrderRepository: ServiceOrderRepository;
let findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase;
let deleteServiceOrderUseCase: DeleteServiceOrderUseCase;
let deleteServiceOrderInput: DeleteServiceOrderInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  findServiceOrderByIdUseCase = new FindServiceOrderByIdUseCase(
    serviceOrderRepository,
  );
  deleteServiceOrderUseCase = new DeleteServiceOrderUseCase(
    serviceOrderRepository,
    findServiceOrderByIdUseCase,
  );
  deleteServiceOrderInput = new DeleteServiceOrderInput(
    deleteServiceOrderUseCase,
  );
};

export const deleteServiceOrderHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await deleteServiceOrderInput.execute(context);
};
