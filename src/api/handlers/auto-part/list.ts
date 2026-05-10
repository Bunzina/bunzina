import { ListAutoPartsInput } from '@/adapters/input/auto-part/list';
import { ListAutoPartsUseCase } from '@/application/use-cases/auto-part/list';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

import { db as dbInstance } from '@/infrastructure/configs/database';

let autoPartRepository: AutoPartRepository;
let listAutoPartsUseCase: ListAutoPartsUseCase;
let listAutoPartsInput: ListAutoPartsInput;

const setDependencies = () => {
  autoPartRepository = new AutoPartRepository(dbInstance);
  listAutoPartsUseCase = new ListAutoPartsUseCase(autoPartRepository);
  listAutoPartsInput = new ListAutoPartsInput(listAutoPartsUseCase);
};

export const listAutoPartsHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await listAutoPartsInput.execute(context);
};
