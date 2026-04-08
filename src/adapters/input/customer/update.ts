import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import type { UpdateCustomerUseCase } from '@/application/use-cases/customer/update';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { updateCustomerSchema } from './validations/update-customer-schema';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';

export class UpdateCustomerInput {
  constructor(private updateCustomerUseCase: UpdateCustomerUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { documentNumber } = context.params as { documentNumber: string };
    const { body } = context;

    logger.info({
      message: 'Update customer request',
      data: { documentNumber, body },
    });

    const { data, errors } = validateSchemaZod(updateCustomerSchema, {
      documentNumber,
      ...(body as object),
    });

    if (errors?.length) {
      logger.warn({
        message: 'Update customer validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const customer = await this.updateCustomerUseCase.execute(data!);

      logger.info({
        message: 'Customer updated successfully',
        data: customer,
      });

      return createResponse({
        status: 200,
        data: CustomerPresenter.toHttp(customer),
      });
    }, 'Failed to update customer');
  }
}
