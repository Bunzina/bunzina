import { verifyJwt } from '@/infrastructure/services/jwt';
import { createResponse } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';
import { verifyApiKey } from '@/infrastructure/services/api-key';

async function validateAuthorization(
  context: HandlerContext,
  authorization: string,
): Promise<Response | undefined> {
  if (!authorization.startsWith('Bearer ')) {
    const message = 'Missing or invalid authorization header';

    logger.warn({
      message,
    });

    return createResponse({
      status: 401,
      data: { reason: message },
    });
  }

  const token = authorization.slice(7);

  try {
    if (token) {
      const payload = await verifyJwt(token);

      context.store = { ...context.store, user: payload };
    }
  } catch (error) {
    const message = 'Invalid or expired token';

    logger.warn({
      message,
      data: { error: (error as Error).message },
    });

    return createResponse({
      status: 401,
      data: { reason: message },
    });
  }

  return;
}

function validateApiKey(apiKey: string): Response | undefined {
  try {
    verifyApiKey(apiKey);
  } catch (error) {
    logger.warn({
      message: 'Invalid api key',
      data: { error: (error as Error).message },
    });

    return createResponse({
      status: 401,
      data: { reason: 'Invalid or expired token' },
    });
  }
}

export const authMiddleware = async (
  context: HandlerContext,
): Promise<Response | undefined> => {
  const authorization = context.request.headers.get('Authorization');

  const apiKey = context.request.headers.get('Api-Key');

  if (!authorization && !apiKey) {
    const message = 'Missing or invalid authorization header';

    logger.warn({
      message,
    });

    return createResponse({
      status: 401,
      data: { reason: message },
    });
  }

  if (apiKey) {
    return validateApiKey(apiKey);
  }

  if (!authorization) {
    const message = 'Missing or invalid authorization header';

    logger.warn({
      message,
    });

    return createResponse({
      status: 401,
      data: { reason: message },
    });
  }

  return validateAuthorization(context, authorization);
};
