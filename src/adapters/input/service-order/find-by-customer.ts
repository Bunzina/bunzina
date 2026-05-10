import { ServiceOrderPublicPresenter } from '@/adapters/output/service-order/service-order-public-presenter';
import type { FindServiceOrdersByCustomerUseCase } from '@/application/use-cases/service-order/find-by-customer';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import { findCustomerSchema } from '@/adapters/input/customer/validations/find-customer-schema';

export class FindServiceOrdersByCustomerInput {
  constructor(
    private findServiceOrdersByCustomerUseCase: FindServiceOrdersByCustomerUseCase,
  ) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { documentNumber } = context.params as { documentNumber: string };

    logger.info({
      message: 'Find service orders by customer request',
      data: { documentNumber },
    });

    const { errors } = validateSchemaZod(findCustomerSchema, {
      documentNumber,
    });

    if (errors?.length) {
      logger.warn({
        message: 'Find service orders by customer validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const serviceOrders =
        await this.findServiceOrdersByCustomerUseCase.execute({
          documentNumber,
        });

      logger.info({
        message: 'Service orders found successfully',
        data: { count: serviceOrders.length },
      });

      return createResponse({
        status: StatusCodes.OK,
        data: serviceOrders.map(ServiceOrderPublicPresenter.toHttp),
      });
    }, 'Failed to find service orders for customer');
  }
}
