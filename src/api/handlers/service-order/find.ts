import type { Context } from 'elysia';
import { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { FindServiceOrderByIdInput } from '@/adapters/input/service-order/find-by-id';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';

let findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase;
let serviceOrderRepository: ServiceOrderRepository;
let findServiceOrderByIdInput: FindServiceOrderByIdInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  findServiceOrderByIdUseCase = new FindServiceOrderByIdUseCase(
    serviceOrderRepository,
  );
  findServiceOrderByIdInput = new FindServiceOrderByIdInput(
    findServiceOrderByIdUseCase,
  );
};

export const findServiceOrderHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findServiceOrderByIdInput.execute(context);
};
