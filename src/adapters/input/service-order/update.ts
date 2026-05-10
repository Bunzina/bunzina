import { ServiceOrderPresenter } from '@/adapters/output/service-order/service-order-presenter';
import type { UpdateServiceOrderUseCase } from '@/application/use-cases/service-order/update';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import {
  updateServiceOrderSchema,
  type UpdateServiceOrderInput as UpdateServiceOrderHttpInput,
} from './validations/update-service-order-schema';

export class UpdateServiceOrderInput {
  constructor(private updateServiceOrderUseCase: UpdateServiceOrderUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { body } = context;
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Update service order request',
      data: { id, body },
    });

    const { data, errors } = validateSchemaZod(updateServiceOrderSchema, {
      ...(body as object),
      id,
    } as UpdateServiceOrderHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Update service order validation error',
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
      const serviceOrder = await this.updateServiceOrderUseCase.execute(
        data as UpdateServiceOrderHttpInput,
      );

      logger.info({
        message: 'Service order updated successfully',
        data: serviceOrder,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: ServiceOrderPresenter.toHttp(serviceOrder),
      });
    }, 'Failed to update service order');
  }
}
