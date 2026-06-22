import { ServicesListPresenter } from '@/adapters/output/service/services-list-presenter';
import type { ListServicesUseCase } from '@/application/use-cases/service/list';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import {
  listServiceSchema,
  type ListServicesHttpInput,
} from './validations/list-service-schema';

export class ListServicesInput {
  constructor(private listServicesUseCase: ListServicesUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const query = context.query as Record<string, unknown>;

    logger.info({
      message: 'List services request',
      data: query,
    });

    const { data, errors } = validateSchemaZod(listServiceSchema, query);

    if (errors?.length) {
      logger.warn({
        message: 'List services validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const result = await this.listServicesUseCase.execute(
        data! as ListServicesHttpInput,
      );

      logger.info({
        message: 'Services listed successfully',
        data: {
          count: result.data.length,
        },
      });

      return createResponse({
        status: StatusCodes.OK,
        data: ServicesListPresenter.toHttp(
          result.data,
          (data! as ListServicesHttpInput).page,
          (data! as ListServicesHttpInput).limit,
        ),
      });
    }, 'Failed to list services');
  }
}
