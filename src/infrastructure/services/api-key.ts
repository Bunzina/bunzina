import logger from '@lucas-pmelo/logger';

const API_KEY = process.env.API_KEY ?? 'bunzina-api-key';

export function verifyApiKey(apiKey: string) {
  if (apiKey !== API_KEY) {
    logger.warn('Client with wrong api key trying to acess');

    throw new Error('Unauthorized');
  }
}
