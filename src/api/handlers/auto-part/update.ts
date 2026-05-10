import { UpdateAutoPartInput } from '@/adapters/input/auto-part/update';
import { CreateStockMovementUseCase } from '@/application/use-cases/auto-part/create-stock-movement';
import { UpdateAutoPartUseCase } from '@/application/use-cases/auto-part/update';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import { StockMovementRepository } from '@/infrastructure/repositories/auto-part/stock-movement-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let autoPartRepository: AutoPartRepository;
let stockMovementRepository: StockMovementRepository;
let createStockMovementUseCase: CreateStockMovementUseCase;
let updateAutoPartUseCase: UpdateAutoPartUseCase;
let updateAutoPartInput: UpdateAutoPartInput;

const setDependencies = () => {
  autoPartRepository = new AutoPartRepository(dbInstance);
  stockMovementRepository = new StockMovementRepository(dbInstance);
  createStockMovementUseCase = new CreateStockMovementUseCase(
    stockMovementRepository,
  );
  updateAutoPartUseCase = new UpdateAutoPartUseCase(
    autoPartRepository,
    createStockMovementUseCase,
  );
  updateAutoPartInput = new UpdateAutoPartInput(updateAutoPartUseCase);
};

export const updateAutoPartHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateAutoPartInput.execute(context);
};
