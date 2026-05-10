import type { HandlerContext } from '@/api/handler-context';
import { CreateAutoPartUseCase } from '@/application/use-cases/auto-part/create';
import { CreateAutoPartInput } from '@/adapters/input/auto-part/create';
import { AutoPartRepository } from '@/infrastructure/repositories/auto-part/auto-part-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';

let createAutoPartUseCase: CreateAutoPartUseCase;
let autoPartRepository: AutoPartRepository;
let createAutoPartInput: CreateAutoPartInput;

const setDependencies = () => {
  autoPartRepository = new AutoPartRepository(dbInstance);
  createAutoPartUseCase = new CreateAutoPartUseCase(autoPartRepository);
  createAutoPartInput = new CreateAutoPartInput(createAutoPartUseCase);
};

export const createAutoPartHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createAutoPartInput.execute(context);
};
