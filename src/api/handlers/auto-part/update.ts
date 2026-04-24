import { UpdateAutoPartInput } from '@/adapters/input/auto-part/update';
import { UpdateAutoPartUseCase } from '@/application/use-cases/auto-part/update';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let autoPartRepository: AutoPartRepository;
let updateAutoPartUseCase: UpdateAutoPartUseCase;
let updateAutoPartInput: UpdateAutoPartInput;

const setDependencies = () => {
  autoPartRepository = new AutoPartRepository(dbInstance);
  updateAutoPartUseCase = new UpdateAutoPartUseCase(autoPartRepository);
  updateAutoPartInput = new UpdateAutoPartInput(updateAutoPartUseCase);
};

export const updateAutoPartHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateAutoPartInput.execute(context);
};
