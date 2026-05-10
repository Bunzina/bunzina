import { ListServiceOrdersInput } from '@/adapters/input/service-order/list';
import { ListServiceOrdersUseCase } from '@/application/use-cases/service-order/list';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let serviceOrderRepository: ServiceOrderRepository;
let listServiceOrdersUseCase: ListServiceOrdersUseCase;
let listServiceOrdersInput: ListServiceOrdersInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  listServiceOrdersUseCase = new ListServiceOrdersUseCase(
    serviceOrderRepository,
  );
  listServiceOrdersInput = new ListServiceOrdersInput(listServiceOrdersUseCase);
};

export const listServiceOrdersHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await listServiceOrdersInput.execute(context);
};
