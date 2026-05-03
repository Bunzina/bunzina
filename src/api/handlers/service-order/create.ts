import type { Context } from 'elysia';
import { CreateServiceOrderUseCase } from '@/application/use-cases/service-order/create';
import { CreateServiceOrderInput } from '@/adapters/input/service-order/create';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';

let createServiceOrderUseCase: CreateServiceOrderUseCase;
let serviceOrderRepository: ServiceOrderRepository;
let createServiceOrderInput: CreateServiceOrderInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  createServiceOrderUseCase = new CreateServiceOrderUseCase(
    serviceOrderRepository,
  );
  createServiceOrderInput = new CreateServiceOrderInput(
    createServiceOrderUseCase,
  );
};

export const createServiceOrderHandler = async (
  context: Context,
): Promise<Response | undefined> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createServiceOrderInput.execute(context);
};
