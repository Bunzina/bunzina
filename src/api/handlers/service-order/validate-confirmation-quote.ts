import type { HandlerContext } from '@/api/handler-context';
import { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';
import { ValidateQuoteConfirmationInput } from '@/adapters/input/service-order/validate-quote-confirmation';
import { ValidateQuoteConfirmationUseCase } from '@/application/use-cases/service-order/validate-quote-confirmation';
import { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';

let customerRepository: CustomerRepository;
let serviceOrderRepository: ServiceOrderRepository;
let findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase;
let findCustomerByIdUseCase: FindCustomerByIdUseCase;
let validateQuoteConfirmationUseCase: ValidateQuoteConfirmationUseCase;
let validateQuoteConfirmationInput: ValidateQuoteConfirmationInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  customerRepository = new CustomerRepository(dbInstance);
  findServiceOrderByIdUseCase = new FindServiceOrderByIdUseCase(
    serviceOrderRepository,
  );

  findCustomerByIdUseCase = new FindCustomerByIdUseCase(customerRepository);
  validateQuoteConfirmationUseCase = new ValidateQuoteConfirmationUseCase(
    serviceOrderRepository,
    findServiceOrderByIdUseCase,
    findCustomerByIdUseCase,
  );
  validateQuoteConfirmationInput = new ValidateQuoteConfirmationInput(
    validateQuoteConfirmationUseCase,
  );
};

export const validateQuoteConfirmationHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await validateQuoteConfirmationInput.execute(context);
};
