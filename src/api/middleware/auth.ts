import { verifyJwt } from '@/infrastructure/services/jwt';
import { createResponse } from '@lucas-pmelo/handlers';
import logger from '@lucas-pmelo/logger';
import type { HandlerContext } from '@/api/handler-context';

export const authMiddleware = async (
  context: HandlerContext,
): Promise<Response | undefined> => {
  const authorization = context.request.headers.get('Authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    logger.warn({
      message: 'Missing or invalid authorization header',
    });

    return createResponse({
      status: 401,
      data: { reason: 'Missing or invalid authorization header' },
    });
  }

  const token = authorization.slice(7);

  try {
    const payload = await verifyJwt(token);

    context.store = { ...context.store, user: payload };
  } catch (error) {
    logger.warn({
      message: 'Invalid or expired token',
      data: { error: (error as Error).message },
    });

    return createResponse({
      status: 401,
      data: { reason: 'Invalid or expired token' },
    });
  }
};
