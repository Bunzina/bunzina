import { UpdateServiceOrderStatusInput } from '@/adapters/input/service-order/update-status';
import { UpdateServiceOrderStatusUseCase } from '@/application/use-cases/service-order/update-status';
import { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let serviceOrderRepository: ServiceOrderRepository;
let findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase;
let updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase;
let updateServiceOrderStatusInput: UpdateServiceOrderStatusInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  findServiceOrderByIdUseCase = new FindServiceOrderByIdUseCase(
    serviceOrderRepository,
  );
  updateServiceOrderStatusUseCase = new UpdateServiceOrderStatusUseCase(
    serviceOrderRepository,
    findServiceOrderByIdUseCase,
  );
  updateServiceOrderStatusInput = new UpdateServiceOrderStatusInput(
    updateServiceOrderStatusUseCase,
  );
};

export const updateServiceOrderStatusHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateServiceOrderStatusInput.execute(context);
};
