import { AutoPartPresenter } from '@/adapters/output/auto-part/auto-part-presenter';
import type { RegisterStockMovementUseCase } from '@/application/use-cases/auto-part/register-stock-movement';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  registerStockMovementSchema,
  type RegisterStockMovementHttpInput,
} from './validations/register-stock-movement-schema';

export class RegisterStockMovementInput {
  constructor(
    private registerStockMovementUseCase: RegisterStockMovementUseCase,
  ) {}

  async execute(context: Context): Promise<Response> {
    const { body } = context;
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Register stock movement request',
      data: { id, body },
    });

    const { data, errors } = validateSchemaZod(registerStockMovementSchema, {
      ...(body as object),
      id,
    } as RegisterStockMovementHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Register stock movement validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const autoPart = await this.registerStockMovementUseCase.execute(data!);

      logger.info({
        message: 'Stock movement registered successfully',
        data: autoPart,
      });

      return createResponse({
        status: StatusCodes.OK,
        data: AutoPartPresenter.toHttp(autoPart),
      });
    }, 'Failed to register stock movement');
  }
}
