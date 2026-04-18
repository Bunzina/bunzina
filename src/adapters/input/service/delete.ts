import type { DeleteServiceUseCase } from '@/application/use-cases/service/delete';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { deleteServiceSchema } from './validations/delete-service-schema';

export class DeleteServiceInput {
  constructor(private deleteServiceUseCase: DeleteServiceUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params;

    logger.info({
      message: 'Delete service request',
      data: { id },
    });

    const { errors, data } = validateSchemaZod(deleteServiceSchema, { id });

    if (errors?.length) {
      logger.warn({
        message: 'Delete service validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      await this.deleteServiceUseCase.execute({ id: data!.id! });

      logger.info({
        message: 'Service deleted successfully',
        data: { id },
      });

      return createResponse({ status: 204, data: null });
    }, 'Failed to delete service');
  }
}
