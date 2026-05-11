import { UpdateServiceOrderStatusInput } from '@/adapters/input/service-order/update-status';
import { UpdateServiceOrderStatusUseCase } from '@/application/use-cases/service-order/update-status';
import { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import { ServiceOrderRepository } from '@/infrastructure/repositories/service-order/service-order-repository';
import { CustomerRepository } from '@/infrastructure/repositories/customer/customer-repository';
import { NotificationService } from '@/infrastructure/services/notification';
import {
  DEFAULT_EMAIL,
  emailTransporter,
} from '@/infrastructure/configs/email-transporter';
import { db as dbInstance } from '@/infrastructure/configs/database';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

let serviceOrderRepository: ServiceOrderRepository;
let customerRepository: CustomerRepository;
let findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase;
let findCustomerByIdUseCase: FindCustomerByIdUseCase;
let notificationService: NotificationService;
let updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase;
let updateServiceOrderStatusInput: UpdateServiceOrderStatusInput;

const setDependencies = () => {
  serviceOrderRepository = new ServiceOrderRepository(dbInstance);
  customerRepository = new CustomerRepository(dbInstance);
  findServiceOrderByIdUseCase = new FindServiceOrderByIdUseCase(
    serviceOrderRepository,
  );
  findCustomerByIdUseCase = new FindCustomerByIdUseCase(customerRepository);
  notificationService = new NotificationService(
    emailTransporter,
    DEFAULT_EMAIL,
  );
  updateServiceOrderStatusUseCase = new UpdateServiceOrderStatusUseCase(
    serviceOrderRepository,
    findServiceOrderByIdUseCase,
    findCustomerByIdUseCase,
    notificationService,
  );
  updateServiceOrderStatusInput = new UpdateServiceOrderStatusInput(
    updateServiceOrderStatusUseCase,
  );
};

export const updateServiceOrderStatusHandler = async (
  context: HandlerContext,
): Promise<Response> => {
  logger.setEvent('bunzina', context.request);
  logger.debug({
    message: 'Event received',
    data: context.request,
  });

  setDependencies();

  return await updateServiceOrderStatusInput.execute(context);
};
