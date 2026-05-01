import { AutoPartPresenter } from '@/adapters/output/auto-part/auto-part-presenter';
import type { FindAutoPartByIdUseCase } from '@/application/use-cases/auto-part/find-by-id';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import { findAutoPartSchema } from './validations/find-auto-part-schema';

export class FindAutoPartByIdInput {
  constructor(private findAutoPartByIdUseCase: FindAutoPartByIdUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Find auto part request',
      data: { id },
    });

    const { errors } = validateSchemaZod(findAutoPartSchema, { id });

    if (errors?.length) {
      logger.warn({
        message: 'Find auto part validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const autoPart = await this.findAutoPartByIdUseCase.execute({ id });

      logger.info({
        message: 'Auto part found successfully',
        data: autoPart,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: AutoPartPresenter.toHttp(autoPart),
      });
    }, 'Failed to find auto part');
  }
}
