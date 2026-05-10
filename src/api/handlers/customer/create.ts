import { CreateCustomerInput } from '@/adapters/input/customer/create';
import { CreateCustomerUseCase } from '@/application/use-cases/customer/create';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let createCustomerUseCase: CreateCustomerUseCase;
let customerRepository: CustomerRepository;
let createCustomerInput: CreateCustomerInput;

const setDependencies = () => {
  customerRepository = new CustomerRepository(dbInstance);
  createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
  createCustomerInput = new CreateCustomerInput(createCustomerUseCase);
};

export const createCustomerHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createCustomerInput.execute(context);
};
