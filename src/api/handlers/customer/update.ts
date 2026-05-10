import { UpdateCustomerInput } from '@/adapters/input/customer/update';
import { UpdateCustomerUseCase } from '@/application/use-cases/customer/update';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let customerRepository: CustomerRepository;
let updateCustomerUseCase: UpdateCustomerUseCase;
let updateCustomerInput: UpdateCustomerInput;

const setDependencies = () => {
  customerRepository = new CustomerRepository(dbInstance);
  updateCustomerUseCase = new UpdateCustomerUseCase(customerRepository);
  updateCustomerInput = new UpdateCustomerInput(updateCustomerUseCase);
};

export const updateCustomerHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateCustomerInput.execute(context);
};
