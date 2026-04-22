import { FindAutoPartByIdUseCase } from '@/application/use-cases/auto-part/find-by-id';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

import { FindAutoPartByIdInput } from '@/adapters/input/auto-part/find-by-id';
import { db as dbInstance } from '@/infrastructure/configs/database';

let autoPartRepository: AutoPartRepository;
let findAutoPartByIdUseCase: FindAutoPartByIdUseCase;
let findAutoPartByIdInput: FindAutoPartByIdInput;

const setDependencies = () => {
  autoPartRepository = new AutoPartRepository(dbInstance);
  findAutoPartByIdUseCase = new FindAutoPartByIdUseCase(autoPartRepository);
  findAutoPartByIdInput = new FindAutoPartByIdInput(findAutoPartByIdUseCase);
};

export const findAutoPartHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findAutoPartByIdInput.execute(context);
};
