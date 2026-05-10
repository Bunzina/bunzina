import { UserPresenter } from '@/adapters/output/user/user-presenter';
import type { FindUserUseCase } from '@/application/use-cases/user/find';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import { findUserSchema } from './validations/find-user-schema';

export class FindUserInput {
  constructor(private findUserUseCase: FindUserUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { id } = context.params as { id: string };

    logger.info({
      message: 'Find user request',
      data: { id },
    });

    const { errors } = validateSchemaZod(findUserSchema, { id });

    if (errors?.length) {
      logger.warn({
        message: 'Find user validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const user = await this.findUserUseCase.execute({ id });

      logger.info({
        message: 'User found successfully',
        data: { id },
      });

      return createResponse({
        status: StatusCodes.OK,
        data: UserPresenter.toHttp(user),
      });
    }, 'Failed to find user');
  }
}
