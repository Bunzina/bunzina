import { ServiceOrderPresenter } from '@/adapters/output/service-order/service-order-presenter';
import type { UpdateServiceOrderStatusUseCase } from '@/application/use-cases/service-order/update-status';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  updateServiceOrderStatusSchema,
  type UpdateServiceOrderStatusInput as UpdateServiceOrderStatusHttpInput,
} from './validations/update-service-order-status-schema';

export class UpdateServiceOrderStatusInput {
  constructor(
    private updateServiceOrderStatusUseCase: UpdateServiceOrderStatusUseCase,
  ) {}

  async execute(context: Context): Promise<Response> {
    const { body } = context;
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Update service order status request',
      data: { id, body },
    });

    const { data, errors } = validateSchemaZod(updateServiceOrderStatusSchema, {
      ...(body as object),
      id,
    } as UpdateServiceOrderStatusHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Update service order status validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: {
          reason: 'Invalid data in request',
          invalidParams: errors,
        },
      });
    }

    return withErrorHandler(async () => {
      const serviceOrder = await this.updateServiceOrderStatusUseCase.execute(
        data as UpdateServiceOrderStatusHttpInput,
      );

      logger.info({
        message: 'Service order status updated successfully',
        data: serviceOrder,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: ServiceOrderPresenter.toHttp(serviceOrder),
      });
    }, 'Failed to update service order status');
  }
}
