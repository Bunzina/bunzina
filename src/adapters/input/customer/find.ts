import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import type { FindCustomerUseCase } from '@/application/use-cases/customer/find';
import { createResponse, withErrorHandler } from '@lucas-pmelo/lambda-handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { findCustomerSchema } from './validations/find-customer-schema';

export class FindCustomerInput {
  constructor(private findCustomerUseCase: FindCustomerUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { documentNumber } = context.params as { documentNumber: string };

    logger.info({
      message: 'Find customer request',
      data: { documentNumber },
    });

    const { errors } = validateSchemaZod(findCustomerSchema, { documentNumber });

    if (errors?.length) {
      logger.warn({
        message: 'Find customer validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const customer = await this.findCustomerUseCase.execute({ documentNumber });

      logger.info({
        message: 'Customer found successfully',
        data: customer,
      });

      return createResponse({ status: 200, data: CustomerPresenter.toHttp(customer) });
    }, 'Failed to find customer');
  }
}
