import logger from '@lucas-pmelo/logger';

export function verifyApiKey(apiKey: string) {
  const apiKeyFromEnvironment = process.env.API_KEY ?? 'bunzina-api-key';

  if (apiKey !== apiKeyFromEnvironment) {
    logger.warn('Client with wrong api key trying to acess');

    throw new Error('Unauthorized');
  }
}
