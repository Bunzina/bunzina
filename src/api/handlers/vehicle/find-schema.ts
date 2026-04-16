import { t } from 'elysia';

export const findVehicleSchema = {
  detail: {
    tags: ['Vehicles'],
    summary: 'Buscar veículo',
    description: 'Busca um veículo pelo ID.',
    responses: {
      '200': { description: 'Veículo encontrado' },
      '404': { description: 'Veículo não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'ID do veículo (UUID)',
      examples: ['550e8400-e29b-41d4-a716-446655440000'],
    }),
  }),
};
