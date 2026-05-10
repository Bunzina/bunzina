import { AutoPartsListPresenter } from '@/adapters/output/auto-part/auto-parts-list-presenter';
import type { ListAutoPartsUseCase } from '@/application/use-cases/auto-part/list';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  listAutoPartSchema,
  type ListAutoPartsInput as ListAutoPartsInputType,
} from './validations/list-auto-part-schema';

export class ListAutoPartsInput {
  constructor(private listAutoPartsUseCase: ListAutoPartsUseCase) {}

  async execute(context: Context): Promise<Response> {
    const query = context.query as Record<string, unknown>;

    logger.info({
      message: 'List auto parts request',
      data: query,
    });

    const { data, errors } = validateSchemaZod(listAutoPartSchema, query);

    if (errors?.length) {
      logger.warn({
        message: 'List auto parts validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const result = await this.listAutoPartsUseCase.execute(
        data! as ListAutoPartsInputType,
      );

      logger.info({
        message: 'Auto parts listed successfully',
        data: {
          count: result.data.length,
        },
      });

      return createResponse({
        status: StatusCodes.OK,
        data: AutoPartsListPresenter.toHttp(
          result.data,
          (data! as ListAutoPartsInputType).page,
          (data! as ListAutoPartsInputType).limit,
        ),
      });
    }, 'Failed to list auto parts');
  }
}
