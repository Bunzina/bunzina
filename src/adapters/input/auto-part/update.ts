import { AutoPartPresenter } from '@/adapters/output/auto-part/auto-part-presenter';
import type { UpdateAutoPartUseCase } from '@/application/use-cases/auto-part/update';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  updateAutoPartSchema,
  type UpdateAutoPartHttpInput,
} from './validations/update-auto-part-schema';

export class UpdateAutoPartInput {
  constructor(private updateAutoPartUseCase: UpdateAutoPartUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { body } = context;
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Update auto part request',
      data: { id, body },
    });

    const { data, errors } = validateSchemaZod(updateAutoPartSchema, {
      ...(body as object),
      id,
    } as UpdateAutoPartHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Update auto part validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const autoPart = await this.updateAutoPartUseCase.execute(data!);

      logger.info({
        message: 'Auto part updated successfully',
        data: autoPart,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: AutoPartPresenter.toHttp(autoPart),
      });
    }, 'Failed to update auto part');
  }
}
