import { UserPresenter } from '@/adapters/output/user/user-presenter';
import type { UpdateUserUseCase } from '@/application/use-cases/user/update';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { StatusCodes } from 'http-status-codes';
import {
  updateUserSchema,
  type UpdateUserInput as UpdateUserHttpInput,
} from './validations/update-user-schema';

export class UpdateUserInput {
  constructor(private updateUserUseCase: UpdateUserUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params as { id: string };
    const { body } = context;

    logger.info({
      message: 'Update user request',
      data: { id },
    });

    const { data, errors } = validateSchemaZod(updateUserSchema, {
      id,
      ...(body as object),
    } as UpdateUserHttpInput);

    if (errors?.length) {
      logger.warn({
        message: 'Update user validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const user = await this.updateUserUseCase.execute(data!);

      logger.info({
        message: 'User updated successfully',
        data: { id },
      });

      return createResponse({
        status: StatusCodes.OK,
        data: UserPresenter.toHttp(user),
      });
    }, 'Failed to update user');
  }
}
