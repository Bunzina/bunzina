import { FindCustomerInput } from '@/adapters/input/customer/find';
import { FindCustomerUseCase } from '@/application/use-cases/customer/find';
import { db } from '@/infrastructure/configs/database';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let customerRepository: CustomerRepository;
let findCustomerUseCase: FindCustomerUseCase;
let findCustomerInput: FindCustomerInput;

const setDependencies = (dbInstance = db) => {
  customerRepository = new CustomerRepository(dbInstance);
  findCustomerUseCase = new FindCustomerUseCase(customerRepository);
  findCustomerInput = new FindCustomerInput(findCustomerUseCase);
};

export const findCustomerHandler = async (context: Context): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findCustomerInput.execute(context);
};
