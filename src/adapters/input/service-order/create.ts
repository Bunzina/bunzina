import { ServiceOrderPresenter } from '@/adapters/output/service-order/service-order-presenter';
import { CreateServiceOrderUseCase } from '@/application/use-cases/service-order/create';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  createServiceOrderSchema,
  type CreateServiceOrderInput as CreateServiceOrderHttpInput,
} from './validations/create-service-order-schema';

export class CreateServiceOrderInput {
  constructor(private createServiceOrderUseCase: CreateServiceOrderUseCase) {}

  async execute(context: Context): Promise<Response | undefined> {
    const { body } = context;

    logger.info({
      message: 'Create service order request',
      data: body,
    });

    const { data, errors } = validateSchemaZod(
      createServiceOrderSchema,
      body as CreateServiceOrderHttpInput,
    );

    if (errors?.length) {
      logger.warn({
        message: 'Create service order validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: {
          reason: 'Invalid data in request',
          invalidParams: errors,
        },
      });
    }

    return withErrorHandler(async () => {
      const serviceOrder = await this.createServiceOrderUseCase.execute(
        data as CreateServiceOrderHttpInput,
      );

      logger.info({
        message: 'Service order created successfully',
        data: serviceOrder,
      });

      return createResponse({
        status: StatusCodes.CREATED,
        data: ServiceOrderPresenter.toHttp(serviceOrder),
      });
    }, 'Failed to create service order');
  }
}
