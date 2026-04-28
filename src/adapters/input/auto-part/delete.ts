import type { DeleteAutoPartUseCase } from '@/application/use-cases/auto-part/delete';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { deleteAutoPartSchema } from './validations/delete-auto-part-schema';

export class DeleteAutoPartInput {
  constructor(private deleteAutoPartUseCase: DeleteAutoPartUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Delete auto part request',
      data: { id },
    });

    const { errors, data } = validateSchemaZod(deleteAutoPartSchema, { id });

    if (errors?.length) {
      logger.warn({
        message: 'Delete auto part validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      await this.deleteAutoPartUseCase.execute({ id: data!.id! });

      logger.info({
        message: 'Auto part deleted successfully',
        data: { id },
      });

      return createResponse({ status: StatusCodes.NO_CONTENT, data: null });
    }, 'Failed to delete auto part');
  }
}
