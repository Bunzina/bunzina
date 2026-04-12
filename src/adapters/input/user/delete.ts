import type { DeleteUserUseCase } from '@/application/use-cases/user/delete';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import { deleteUserSchema } from './validations/delete-user-schema';

export class DeleteUserInput {
  constructor(private deleteUserUseCase: DeleteUserUseCase) {}

  async execute(context: Context): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Delete user request',
      data: { id },
    });

    const { errors } = validateSchemaZod(deleteUserSchema, { id });

    if (errors?.length) {
      logger.warn({
        message: 'Delete user validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      await this.deleteUserUseCase.execute({ id });

      logger.info({
        message: 'User deleted successfully',
        data: { id },
      });

      return createResponse({ status: 204, data: null });
    }, 'Failed to delete user');
  }
}
