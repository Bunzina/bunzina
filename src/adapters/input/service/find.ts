import { ServicePresenter } from '@/adapters/output/service/service-presenter';
import type { FindServiceUseCase } from '@/application/use-cases/service/find';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  findServiceSchema,
  type FindServiceHttpInput,
} from './validations/find-service-schema';

export class FindServiceInput {
  constructor(private readonly findServiceUseCase: FindServiceUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params;

    logger.info({
      message: 'Find service request',
      data: { id },
    });

    const { errors, data } = validateSchemaZod(findServiceSchema, {
      id,
    } as FindServiceHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Find service validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const service = await this.findServiceUseCase.execute(data!.id);

      logger.info({
        message: 'Service found successfully',
        data: service,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: ServicePresenter.toHttp(service),
      });
    }, 'Failed to find service');
  }
}
