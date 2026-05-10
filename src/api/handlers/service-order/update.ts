import type { HandlerContext } from '@/api/handler-context';
import { UpdateServiceOrderUseCase } from '@/application/use-cases/service-order/update';
import { UpdateServiceOrderInput } from '@/adapters/input/service-order/update';
import { FindAutoPartByIdUseCase } from '@/application/use-cases/auto-part/find-by-id';
import { FindServiceByIdUseCase } from '@/application/use-cases/service/find-by-id';
import { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import { ServiceRepository } from '@/infrastructure/repositories/service/service-repository';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';

let updateServiceOrderUseCase: UpdateServiceOrderUseCase;
let serviceOrderRepository: ServiceOrderRepository;
let serviceRepository: ServiceRepository;
let autoPartRepository: AutoPartRepository;
let findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase;
let findServiceByIdUseCase: FindServiceByIdUseCase;
let findAutoPartByIdUseCase: FindAutoPartByIdUseCase;
let updateServiceOrderInput: UpdateServiceOrderInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  serviceRepository = new ServiceRepository(dbInstance);
  autoPartRepository = new AutoPartRepository(dbInstance);
  findServiceOrderByIdUseCase = new FindServiceOrderByIdUseCase(
    serviceOrderRepository,
  );
  findServiceByIdUseCase = new FindServiceByIdUseCase(serviceRepository);
  findAutoPartByIdUseCase = new FindAutoPartByIdUseCase(autoPartRepository);
  updateServiceOrderUseCase = new UpdateServiceOrderUseCase(
    serviceOrderRepository,
    findServiceOrderByIdUseCase,
    findServiceByIdUseCase,
    findAutoPartByIdUseCase,
  );
  updateServiceOrderInput = new UpdateServiceOrderInput(
    updateServiceOrderUseCase,
  );
};

export const updateServiceOrderHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateServiceOrderInput.execute(context);
};
