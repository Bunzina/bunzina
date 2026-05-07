import { CompleteServiceItemUseCase } from '@/application/use-cases/service-order/complete-service-item';
import { CompleteServiceItemInput } from '@/adapters/input/service-order/complete-service-item';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let serviceOrderRepository: ServiceOrderRepository;
let completeServiceItemUseCase: CompleteServiceItemUseCase;
let completeServiceItemInput: CompleteServiceItemInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  completeServiceItemUseCase = new CompleteServiceItemUseCase(
    serviceOrderRepository,
  );
  completeServiceItemInput = new CompleteServiceItemInput(
    completeServiceItemUseCase,
  );
};

export const completeServiceItemHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await completeServiceItemInput.execute(context);
};
