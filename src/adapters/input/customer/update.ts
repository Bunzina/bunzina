import { CustomerPresenter } from '@/adapters/output/customer/customer-presenter';
import type { UpdateCustomerUseCase } from '@/application/use-cases/customer/update';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import {
  updateCustomerSchema,
  type UpdateCustomerInput as UpdateCustomerHttpInput,
} from './validations/update-customer-schema';

export class UpdateCustomerInput {
  constructor(private updateCustomerUseCase: UpdateCustomerUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { documentNumber } = context.params as { documentNumber: string };
    const { body } = context;

    logger.info({
      message: 'Update customer request',
      data: { documentNumber, body },
    });

    const { data, errors } = validateSchemaZod(updateCustomerSchema, {
      documentNumber,
      ...(body as object),
    } as UpdateCustomerHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Update customer validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
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
        status: StatusCodes.OK,
        data: CustomerPresenter.toHttp(customer),
      });
    }, 'Failed to update customer');
  }
}
