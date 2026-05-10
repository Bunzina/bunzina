import { ServicePresenter } from '@/adapters/output/service/service-presenter';
import type { FindServiceByIdUseCase } from '@/application/use-cases/service/find-by-id';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  findServiceByIdSchema,
  type FindServiceByIdHttpInput,
} from './validations/find-service-by-id-schema';

export class FindServiceByIdInput {
  constructor(
    private readonly findServiceByIdUseCase: FindServiceByIdUseCase,
  ) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params;

    logger.info({
      message: 'Find service request',
      data: { id },
    });

    const { errors, data } = validateSchemaZod(findServiceByIdSchema, {
      id,
    } as FindServiceByIdHttpInput);

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
      const service = await this.findServiceByIdUseCase.execute({
        id: data!.id,
      });

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
