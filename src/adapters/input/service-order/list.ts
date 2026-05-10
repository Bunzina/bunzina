import { ServiceOrdersListPresenter } from '@/adapters/output/service-order/service-orders-list-presenter';
import type { ListServiceOrdersUseCase } from '@/application/use-cases/service-order/list';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  listServiceOrdersSchema,
  type ListServiceOrdersInput as ListServiceOrdersInputType,
} from './validations/list-service-orders-schema';

export class ListServiceOrdersInput {
  constructor(private listServiceOrdersUseCase: ListServiceOrdersUseCase) {}

  async execute(context: Context): Promise<Response> {
    const query = context.query as Record<string, unknown>;

    logger.info({
      message: 'List service orders request',
      data: query,
    });

    const { data, errors } = validateSchemaZod(listServiceOrdersSchema, query);

    if (errors?.length) {
      logger.warn({
        message: 'List service orders validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const result = await this.listServiceOrdersUseCase.execute(
        data! as ListServiceOrdersInputType,
      );

      logger.info({
        message: 'Service orders listed successfully',
        data: {
          count: result.data.length,
        },
      });

      return createResponse({
        status: StatusCodes.OK,
        data: ServiceOrdersListPresenter.toHttp(
          result.data,
          (data! as ListServiceOrdersInputType).page,
          (data! as ListServiceOrdersInputType).limit,
        ),
      });
    }, 'Failed to list service orders');
  }
}
