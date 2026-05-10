import { LoginInput } from '@/adapters/input/user/login';
import { LoginUseCase } from '@/application/use-cases/user/login';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { UserRepository } from '@/infrastructure/repositories/user/user-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let loginUseCase: LoginUseCase;
let userRepository: UserRepository;
let loginInput: LoginInput;

const setDependencies = () => {
  userRepository = new UserRepository(dbInstance);
  loginUseCase = new LoginUseCase(userRepository);
  loginInput = new LoginInput(loginUseCase);
};

export const loginHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await loginInput.execute(context);
};
