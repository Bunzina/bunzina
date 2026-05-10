import { t } from 'elysia';

export const healthSchema = {
  detail: {
    tags: ['Health'],
    summary: 'Healthcheck',
    description: 'Verifica se a API está no ar.',
    responses: {
      '200': { description: 'API online' },
    },
  },
  response: {
    200: t.Object({
      status: t.Literal('ok'),
    }),
  },
};
