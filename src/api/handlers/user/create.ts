import { CreateUserInput } from '@/adapters/input/user/create';
import { CreateUserUseCase } from '@/application/use-cases/user/create';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { UserRepository } from '@/infrastructure/repositories/user/user-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let createUserUseCase: CreateUserUseCase;
let userRepository: UserRepository;
let createUserInput: CreateUserInput;

const setDependencies = () => {
  userRepository = new UserRepository(dbInstance);
  createUserUseCase = new CreateUserUseCase(userRepository);
  createUserInput = new CreateUserInput(createUserUseCase);
};

export const createUserHandler = async (
  context: Context,
): Promise<Response | undefined> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createUserInput.execute(context);
};
