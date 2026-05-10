import { ListStockMovementsInput } from '@/adapters/input/auto-part/list-stock-movements';
import { ListStockMovementsUseCase } from '@/application/use-cases/auto-part/list-stock-movements';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import { StockMovementRepository } from '@/infrastructure/repositories/auto-part/stock-movement-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let autoPartRepository: AutoPartRepository;
let stockMovementRepository: StockMovementRepository;
let listStockMovementsUseCase: ListStockMovementsUseCase;
let listStockMovementsInput: ListStockMovementsInput;

const setDependencies = () => {
  autoPartRepository = new AutoPartRepository(dbInstance);
  stockMovementRepository = new StockMovementRepository(dbInstance);
  listStockMovementsUseCase = new ListStockMovementsUseCase(
    autoPartRepository,
    stockMovementRepository,
  );
  listStockMovementsInput = new ListStockMovementsInput(
    listStockMovementsUseCase,
  );
};

export const listStockMovementsHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await listStockMovementsInput.execute(context);
};
