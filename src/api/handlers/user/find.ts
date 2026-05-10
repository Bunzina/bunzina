import { FindUserInput } from '@/adapters/input/user/find';
import { FindUserUseCase } from '@/application/use-cases/user/find';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { UserRepository } from '@/infrastructure/repositories/user/user-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let userRepository: UserRepository;
let findUserUseCase: FindUserUseCase;
let findUserInput: FindUserInput;

const setDependencies = () => {
  userRepository = new UserRepository(dbInstance);
  findUserUseCase = new FindUserUseCase(userRepository);
  findUserInput = new FindUserInput(findUserUseCase);
};

export const findUserHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findUserInput.execute(context);
};
