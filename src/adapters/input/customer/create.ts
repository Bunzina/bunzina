import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import type { CreateCustomerUseCase } from '@/application/use-cases/customer/create';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  type CreateCustomerInput as CreateCustomerHttpInput,
  createCustomerSchema,
} from './validations/create-customer-schema';

export class CreateCustomerInput {
  constructor(private createCustomerUseCase: CreateCustomerUseCase) {}

  async execute(context: Context): Promise<Response | undefined> {
    const { body } = context;

    logger.info({
      message: 'Create customer request',
      data: body,
    });

    const { data, errors } = validateSchemaZod(
      createCustomerSchema,
      body as CreateCustomerHttpInput,
    );

    if (errors?.length) {
      logger.warn({
        message: 'Create customer validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
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
        status: StatusCodes.CREATED,
        data: CustomerPresenter.toHttp(customer),
      });
    }, 'Failed to create customer');
  }
}
