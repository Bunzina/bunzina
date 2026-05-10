import type { DeleteCustomerUseCase } from '@/application/use-cases/customer/delete';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { deleteCustomerSchema } from './validations/delete-customer-schema';

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
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      await this.deleteCustomerUseCase.execute({ documentNumber });

      logger.info({
        message: 'Customer deleted successfully',
        data: { documentNumber },
      });

      return createResponse({ status: StatusCodes.NO_CONTENT, data: null });
    }, 'Failed to delete customer');
  }
}
