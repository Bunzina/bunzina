import { UserPresenter } from '@/adapters/output/user/user-presenter';
import type { CreateUserUseCase } from '@/application/use-cases/user/create';
import { UserRole } from '@/domain/user/types/user-role';
import { verifyJwt } from '@/infrastructure/services/jwt';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import {
  createUserSchema,
  type CreateUserInput as CreateUserHttpInput,
} from './validations/create-user-schema';

export class CreateUserInput {
  constructor(private createUserUseCase: CreateUserUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { body } = context;

    logger.info({
      message: 'Create user request',
    });

    const { data, errors } = validateSchemaZod(
      createUserSchema,
      body as CreateUserHttpInput,
    );

    if (errors?.length) {
      logger.warn({
        message: 'Create user validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    if (data!.role !== UserRole.CUSTOMER) {
      const authError = await this.validateAuth(context);
      if (authError) return authError;
    }

    return withErrorHandler(async () => {
      const user = await this.createUserUseCase.execute(data!);

      logger.info({
        message: 'User created successfully',
        data: { id: user.id },
      });

      return createResponse({
        status: StatusCodes.CREATED,
        data: UserPresenter.toHttp(user),
      });
    }, 'Failed to create user');
  }

  private async validateAuth(
    context: HandlerContext,
  ): Promise<Response | null> {
    const authorization = context.request.headers.get('Authorization');

    if (!authorization || !authorization.startsWith('Bearer ')) {
      logger.warn({
        message: 'Auth required for non-CUSTOMER user creation',
      });

      return createResponse({
        status: StatusCodes.UNAUTHORIZED,
        data: { reason: 'Missing or invalid authorization header' },
      });
    }

    try {
      await verifyJwt(authorization.slice(7));
    } catch {
      logger.warn({
        message: 'Invalid or expired token for user creation',
      });

      return createResponse({
        status: StatusCodes.UNAUTHORIZED,
        data: { reason: 'Invalid or expired token' },
      });
    }
  }
}
