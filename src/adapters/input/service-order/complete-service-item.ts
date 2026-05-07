import type { CompleteServiceItemUseCase } from '@/application/use-cases/service-order/complete-service-item';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  findServiceOrderItemSchema,
  type FindServiceOrderItemInput as FindServiceOrderItemHttpInput,
} from './validations/find-service-order-item-schema';
import { ServiceItemPresenter } from '@/adapters/output/service-order/service-item-presenter';

export class CompleteServiceItemInput {
  constructor(private completeServiceItemUseCase: CompleteServiceItemUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Complete service item request',
      data: { id },
    });

    const { errors } = validateSchemaZod(findServiceOrderItemSchema, {
      id,
    } as FindServiceOrderItemHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Complete service item validation error',
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
      const item = await this.completeServiceItemUseCase.execute({ id });

      logger.info({
        message: 'Service item completed successfully',
        data: { id },
      });

      return createResponse({
        status: StatusCodes.OK,
        data: ServiceItemPresenter.toHttp(item),
      });
    }, 'Failed to complete service item');
  }
}
