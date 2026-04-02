export const healthSchema = {
  detail: {
    tags: ['Health'],
    summary: 'Healthcheck',
    description: 'Verifica se a API está no ar.',
    responses: {
      '200': { description: 'API online' },
    },
  },
};
