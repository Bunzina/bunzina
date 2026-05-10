import { DeleteCustomerInput } from '@/adapters/input/customer/delete';
import { DeleteCustomerUseCase } from '@/application/use-cases/customer/delete';
import { db as dbInstance } from '@/infrastructure/configs/database';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let customerRepository: CustomerRepository;
let deleteCustomerUseCase: DeleteCustomerUseCase;
let deleteCustomerInput: DeleteCustomerInput;

const setDependencies = () => {
  customerRepository = new CustomerRepository(dbInstance);
  deleteCustomerUseCase = new DeleteCustomerUseCase(customerRepository);
  deleteCustomerInput = new DeleteCustomerInput(deleteCustomerUseCase);
};

export const deleteCustomerHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await deleteCustomerInput.execute(context);
};
