import type { DeleteServiceOrderUseCase } from '@/application/use-cases/service-order/delete';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { deleteServiceOrderSchema } from './validations/delete-service-order-schema';

export class DeleteServiceOrderInput {
  constructor(private deleteServiceOrderUseCase: DeleteServiceOrderUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Delete service order request',
      data: { id },
    });

    const { errors, data } = validateSchemaZod(deleteServiceOrderSchema, {
      id,
    });

    if (errors?.length) {
      logger.warn({
        message: 'Delete service order validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      await this.deleteServiceOrderUseCase.execute({
        id: data!.id!,
      });

      logger.info({
        message: 'Service order deleted successfully',
        data: { id },
      });

      return createResponse({ status: StatusCodes.NO_CONTENT, data: null });
    }, 'Failed to delete service order');
  }
}
