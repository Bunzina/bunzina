import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import type { FindCustomerByIdUseCase } from '@/application/use-cases/customer/find-by-id';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import { findCustomerByIdSchema } from './validations/find-customer-by-id-schema';

export class FindCustomerByIdInput {
  constructor(private findCustomerByIdUseCase: FindCustomerByIdUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Find customer by id request',
      data: { id },
    });

    const { errors } = validateSchemaZod(findCustomerByIdSchema, { id });

    if (errors?.length) {
      logger.warn({
        message: 'Find customer by id validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const customer = await this.findCustomerByIdUseCase.execute({ id });

      logger.info({
        message: 'Customer found by id successfully',
        data: customer,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: CustomerPresenter.toHttp(customer),
      });
    }, 'Failed to find customer by id');
  }
}
