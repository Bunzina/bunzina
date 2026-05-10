import { ServiceOrderPresenter } from '@/adapters/output/service-order/service-order-presenter';
import type { FindServiceOrderByIdUseCase } from '@/application/use-cases/service-order/find-by-id';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import {
  findServiceOrderSchema,
  type FindServiceOrderByIdInput as FindServiceOrderByIdHttpInput,
} from './validations/find-service-order-schema';

export class FindServiceOrderByIdInput {
  constructor(
    private findServiceOrderByIdUseCase: FindServiceOrderByIdUseCase,
  ) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Find service order request',
      data: { id },
    });

    const { errors } = validateSchemaZod(findServiceOrderSchema, {
      id,
    } as FindServiceOrderByIdHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Find service order validation error',
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
      const serviceOrder = await this.findServiceOrderByIdUseCase.execute({
        id,
      });

      logger.info({
        message: 'Service order found successfully',
        data: serviceOrder,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: ServiceOrderPresenter.toHttp(serviceOrder),
      });
    }, 'Failed to find service order');
  }
}
