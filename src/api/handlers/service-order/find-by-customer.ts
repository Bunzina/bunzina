import { FindServiceOrdersByCustomerInput } from '../../../adapters/input/service-order/find-by-customer';
import { FindServiceOrdersByCustomerUseCase } from '@/application/use-cases/service-order/find-by-customer';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';
import type { Context } from 'elysia';

let customerRepository: CustomerRepository;
let serviceOrderRepository: ServiceOrderRepository;
let findServiceOrdersByCustomerUseCase: FindServiceOrdersByCustomerUseCase;
let findServiceOrdersByCustomerInput: FindServiceOrdersByCustomerInput;

const setDependencies = () => {
  customerRepository = new CustomerRepository(dbInstance);
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  findServiceOrdersByCustomerUseCase = new FindServiceOrdersByCustomerUseCase(
    customerRepository,
    serviceOrderRepository,
  );
  findServiceOrdersByCustomerInput = new FindServiceOrdersByCustomerInput(
    findServiceOrdersByCustomerUseCase,
  );
};

export const findServiceOrdersByCustomerHandler = async (
  context: Context,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await findServiceOrdersByCustomerInput.execute(context);
};
