import { ServicePresenter } from '@/adapters/output/service/service-presenter';
import type { CreateServiceUseCase } from '@/application/use-cases/service/create';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  createServiceSchema,
  type CreateServiceHttpInput,
} from './validations/create-service-schema';

export class CreateServiceInput {
  constructor(private createServiceUseCase: CreateServiceUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { body } = context;

    logger.info({
      message: 'Create service request',
      data: body,
    });

    const { data, errors } = validateSchemaZod(
      createServiceSchema,
      body as CreateServiceHttpInput,
    );

    if (errors?.length) {
      logger.warn({
        message: 'Create service validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const service = await this.createServiceUseCase.execute(data!);

      logger.info({
        message: 'Service created successfully',
        data: service,
      });

      return createResponse({
        status: StatusCodes.CREATED,
        data: ServicePresenter.toHttp(service),
      });
    }, 'Failed to create service');
  }
}
