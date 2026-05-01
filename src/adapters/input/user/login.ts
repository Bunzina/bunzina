import type { LoginUseCase } from '@/application/use-cases/user/login';
import { createResponse, withErrorHandler } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import { validateSchemaZod } from '@lucas-pmelo/validator';
import type { Context } from 'elysia';
import {
  loginSchema,
  type LoginInput as LoginInputType,
} from './validations/login-schema';

export class LoginInput {
  constructor(private loginUseCase: LoginUseCase) {}

  async execute(context: Context): Promise<Response | undefined> {
    const { body } = context;

    logger.info({
      message: 'Login request',
    });

    const { data, errors } = validateSchemaZod(loginSchema, body);

    if (errors?.length) {
      logger.warn({
        message: 'Login validation error',
        data: errors,
      });

      return createResponse({
        status: 400,
        data: { reason: 'Invalid data in request', invalidParams: errors },
      });
    }

    return withErrorHandler(async () => {
      const result = await this.loginUseCase.execute(data as LoginInputType);

      logger.info({
        message: 'Login successful',
      });

      return createResponse({
        status: 200,
        data: result,
      });
    }, 'Failed to login');
  }
}
