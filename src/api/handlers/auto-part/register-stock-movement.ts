import { RegisterStockMovementInput } from '@/adapters/input/auto-part/register-stock-movement';
import { RegisterStockMovementUseCase } from '@/application/use-cases/auto-part/register-stock-movement';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import { StockMovementRepository } from '@/infrastructure/repositories/auto-part/stock-movement-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let autoPartRepository: AutoPartRepository;
let stockMovementRepository: StockMovementRepository;
let registerStockMovementUseCase: RegisterStockMovementUseCase;
let registerStockMovementInput: RegisterStockMovementInput;

const setDependencies = () => {
  autoPartRepository = new AutoPartRepository(dbInstance);
  stockMovementRepository = new StockMovementRepository(dbInstance);
  registerStockMovementUseCase = new RegisterStockMovementUseCase(
    autoPartRepository,
    stockMovementRepository,
  );
  registerStockMovementInput = new RegisterStockMovementInput(
    registerStockMovementUseCase,
  );
};

export const registerStockMovementHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await registerStockMovementInput.execute(context);
};
