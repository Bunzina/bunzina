import logger from '@lucas-pmelo/logger';
import { timingSafeEqual } from 'node:crypto';

export function verifyApiKey(apiKey: string) {
  const apiKeyFromEnvironment = process.env.API_KEY;

  if (!apiKeyFromEnvironment) {
    throw new Error('API_KEY must be configured');
  }

  const provided = Buffer.from(apiKey);
  const expected = Buffer.from(apiKeyFromEnvironment);

  if (
    provided.length !== expected.length ||
    !timingSafeEqual(provided, expected)
  ) {
    logger.warn('Client with wrong api key trying to acess');

    throw new Error('Unauthorized');
  }
}
