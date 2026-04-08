import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import type { CreateCustomerUseCase } from '@/application/use-cases/customer/create';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { createCustomerSchema } from './validations/create-customer-schema';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';

export class CreateCustomerInput {
  constructor(private createCustomerUseCase: CreateCustomerUseCase) {}

  async execute(context: Context): Promise<Response | undefined> {
    const { body } = context;

    logger.info({
      message: 'Create customer request',
      data: body,
    });

    const { data, errors } = validateSchemaZod(createCustomerSchema, body);

    if (errors?.length) {
      logger.warn({
        message: 'Create customer validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const customer = await this.createCustomerUseCase.execute(data!);

      logger.info({
        message: 'Customer created successfully',
        data: customer,
      });

      return createResponse({
        status: 201,
        data: CustomerPresenter.toHttp(customer),
      });
    }, 'Failed to create customer');
  }
}
