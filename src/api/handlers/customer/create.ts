import { CreateCustomerInput } from '@/adapters/input/customer/create';
import { CreateCustomerUseCase } from '@/application/use-cases/customer/create';
import { db } from '@/infrastructure/configs/database';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let createCustomerUseCase: CreateCustomerUseCase;
let customerRepository: CustomerRepository;
let createCustomerInput: CreateCustomerInput;

const setDependencies = (dbInstance = db) => {
  customerRepository = new CustomerRepository(dbInstance);
  createCustomerUseCase = new CreateCustomerUseCase(customerRepository);
  createCustomerInput = new CreateCustomerInput(createCustomerUseCase);
};

export const createCustomerHandler = async (context: Context): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await createCustomerInput.execute(context);
};
