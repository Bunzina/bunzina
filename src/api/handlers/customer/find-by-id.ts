import { FindCustomerByIdInput } from '@/adapters/input/customer/find-by-id';
import { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let customerRepository: CustomerRepository;
let findCustomerByIdUseCase: FindCustomerByIdUseCase;
let findCustomerByIdInput: FindCustomerByIdInput;

const setDependencies = () => {
  customerRepository = new CustomerRepository(dbInstance);
  findCustomerByIdUseCase = new FindCustomerByIdUseCase(customerRepository);
  findCustomerByIdInput = new FindCustomerByIdInput(findCustomerByIdUseCase);
};

export const findCustomerByIdHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findCustomerByIdInput.execute(context);
};
