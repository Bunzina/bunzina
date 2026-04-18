import { ServicePresenter } from '@/adapters/output/service/service-presenter';
import type { UpdateServiceUseCase } from '@/application/use-cases/service/update';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import {
  updateServiceSchema,
  type UpdateServiceHttpInput,
} from './validations/update-service-schema';

export class UpdateServiceInput {
  constructor(private updateServiceUseCase: UpdateServiceUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { body } = context;
    const { id } = context.params;

    logger.info({
      message: 'Update service request',
      data: body,
    });

    const { data, errors } = validateSchemaZod(updateServiceSchema, {
      ...(body as object),
      id,
    } as UpdateServiceHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Update service validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const service = await this.updateServiceUseCase.execute(data!);

      logger.info({
        message: 'Service updated successfully',
        data: service,
      });

      return createResponse({
        status: 201,
        data: ServicePresenter.toHttp(service),
      });
    }, 'Failed to update service');
  }
}
