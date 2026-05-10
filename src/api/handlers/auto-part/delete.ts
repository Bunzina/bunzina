import { DeleteAutoPartInput } from '@/adapters/input/auto-part/delete';
import { DeleteAutoPartUseCase } from '@/application/use-cases/auto-part/delete';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let deleteAutoPartUseCase: DeleteAutoPartUseCase;
let autoPartRepository: AutoPartRepository;
let deleteAutoPartInput: DeleteAutoPartInput;

const setDependencies = () => {
  autoPartRepository = new AutoPartRepository(dbInstance);
  deleteAutoPartUseCase = new DeleteAutoPartUseCase(autoPartRepository);
  deleteAutoPartInput = new DeleteAutoPartInput(deleteAutoPartUseCase);
};

export const deleteAutoPartHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await deleteAutoPartInput.execute(context);
};
