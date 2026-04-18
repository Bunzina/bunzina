import type { Context } from 'elysia';
import { CreateAutoPartUseCase } from '@/application/use-cases/auto-part/create';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import {
  createAutoPartSchema,
  type CreateAutoPartInput as CreateAutoPartInputType,
} from './validations/create-auto-part-schema';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import { AutoPartPresenter } from '@/adapters/output/auto-part/auto-part-presenter';

export class CreateAutoPartInput {
  constructor(private createAutoPartUseCase: CreateAutoPartUseCase) {}

  async execute(context: Context): Promise<Response | undefined> {
    const { body } = context;

    logger.info({
      message: 'Create auto-part request',
      data: body,
    });

    const { data, errors } = validateSchemaZod(createAutoPartSchema, body);

    if (errors?.length) {
      logger.warn({
        message: 'Create auto-part validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: {
          reason: 'Invalid data in request',
          invalidParams: errors,
        },
      });
    }

    return withErrorHandler(async () => {
      const autoPart = await this.createAutoPartUseCase.execute(
        data as CreateAutoPartInputType,
      );

      logger.info({
        message: 'Auto-part created successfully',
        data: autoPart,
      });

      return createResponse({
        status: 201,
        data: AutoPartPresenter.toHttp(autoPart),
      });
    }, 'Failed to create auto-part');
  }
}
