import { DeleteUserInput } from '@/adapters/input/user/delete';
import { DeleteUserUseCase } from '@/application/use-cases/user/delete';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { UserRepository } from '@/infrastructure/repositories/user/user-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let userRepository: UserRepository;
let deleteUserUseCase: DeleteUserUseCase;
let deleteUserInput: DeleteUserInput;

const setDependencies = () => {
  userRepository = new UserRepository(dbInstance);
  deleteUserUseCase = new DeleteUserUseCase(userRepository);
  deleteUserInput = new DeleteUserInput(deleteUserUseCase);
};

export const deleteUserHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await deleteUserInput.execute(context);
};
