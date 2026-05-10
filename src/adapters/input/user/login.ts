import type { LoginUseCase } from '@/application/use-cases/user/login';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { HandlerContext } from '@/api/handler-context';
import { StatusCodes } from 'http-status-codes';
import {
  loginSchema,
  type LoginInput as LoginHttpInput,
} from './validations/login-schema';

export class LoginInput {
  constructor(private loginUseCase: LoginUseCase) {}

  async execute(context: HandlerContext): Promise<Response> {
    const { body } = context;

    logger.info({
      message: 'Login request',
    });

    const { data, errors } = validateSchemaZod(
      loginSchema,
      body as LoginHttpInput,
    );

    if (errors?.length) {
      logger.warn({
        message: 'Login validation error',
        data: errors,
      });

      return createResponse({
        status: StatusCodes.BAD_REQUEST,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const result = await this.loginUseCase.execute(data!);

      logger.info({
        message: 'Login successful',
      });

      return createResponse({
        status: StatusCodes.OK,
        data: result,
      });
    }, 'Failed to login');
  }
}
