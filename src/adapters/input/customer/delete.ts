import type { DeleteCustomerUseCase } from '@/application/use-cases/customer/delete';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { deleteCustomerSchema } from './validations/delete-customer-schema';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';

export class DeleteCustomerInput {
  constructor(private deleteCustomerUseCase: DeleteCustomerUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { documentNumber } = context.params as { documentNumber: string };

    logger.info({
      message: 'Delete customer request',
      data: { documentNumber },
    });

    const { errors } = validateSchemaZod(deleteCustomerSchema, {
      documentNumber,
    });

    if (errors?.length) {
      logger.warn({
        message: 'Delete customer validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      await this.deleteCustomerUseCase.execute({ documentNumber });

      logger.info({
        message: 'Customer deleted successfully',
        data: { documentNumber },
      });

      return createResponse({ status: 204, data: null });
    }, 'Failed to delete customer');
  }
}
