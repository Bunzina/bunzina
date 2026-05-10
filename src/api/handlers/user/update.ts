import { UpdateUserInput } from '@/adapters/input/user/update';
import { UpdateUserUseCase } from '@/application/use-cases/user/update';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { UserRepository } from '@/infrastructure/repositories/user/user-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let userRepository: UserRepository;
let updateUserUseCase: UpdateUserUseCase;
let updateUserInput: UpdateUserInput;

const setDependencies = () => {
  userRepository = new UserRepository(dbInstance);
  updateUserUseCase = new UpdateUserUseCase(userRepository);
  updateUserInput = new UpdateUserInput(updateUserUseCase);
};

export const updateUserHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateUserInput.execute(context);
};
