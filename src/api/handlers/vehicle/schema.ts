import { t } from 'elysia';

export const createVehicleSchema = {
  detail: {
    tags: ['Vehicles'],
    summary: 'Criar veículo',
    description: 'Cria um novo veículo para um cliente.',
    requestBody: {
      content: {
        'application/json': {
          example: {
            customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            licensePlate: 'ABC1D23',
            model: 'Model S',
            brand: 'Tesla',
            year: 2020,
          },
        },
      },
    },
    responses: {
      '201': { description: 'Veículo criado com sucesso' },
      '400': { description: 'Dados inválidos (placa ou UUID inválido)' },
      '409': { description: 'Veículo já existe' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  body: t.Object({
    customerId: t.String({
      description: 'UUID do cliente',
      examples: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
    }),
    licensePlate: t.String({
      description:
        'Placa do veículo (formato Mercosul: ABC1D23 ou antigo sem hífen: ABC1234)',
      examples: ['ABC1D23', 'ABC1234'],
    }),
    model: t.String({
      description: 'Modelo do veículo',
      examples: ['Model S'],
    }),
    brand: t.String({
      description: 'Marca do veículo',
      examples: ['Tesla'],
    }),
    year: t.Number({
      description: 'Ano do veículo',
      examples: [2020],
    }),
  }),
};

export const updateVehicleSchema = {
  detail: {
    tags: ['Vehicles'],
    summary: 'Atualizar veículo',
    description: 'Atualiza os dados de um veículo existente pelo ID.',
    requestBody: {
      content: {
        'application/json': {
          example: {
            customerId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            licensePlate: 'ABC1D23',
            model: 'Model 3',
            brand: 'Tesla',
            year: 2023,
          },
        },
      },
    },
    responses: {
      '200': { description: 'Veículo atualizado com sucesso' },
      '400': { description: 'Dados inválidos (placa ou UUID inválido)' },
      '404': { description: 'Veículo não encontrado' },
      '409': { description: 'Veículo já existe' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'ID do veículo (UUID)',
      examples: ['550e8400-e29b-41d4-a716-446655440000'],
    }),
  }),
  body: t.Object({
    customerId: t.String({
      description: 'ID do cliente (UUID)',
      examples: ['f47ac10b-58cc-4372-a567-0e02b2c3d479'],
    }),
    licensePlate: t.String({
      description:
        'Placa do veículo (formato Mercosul: ABC1D23 ou antigo: ABC1234)',
      examples: ['ABC1D23', 'ABC1234'],
    }),
    model: t.String({
      description: 'Modelo do veículo',
      examples: ['Model 3'],
    }),
    brand: t.String({
      description: 'Marca do veículo',
      examples: ['Tesla'],
    }),
    year: t.Number({
      description: 'Ano do veículo',
      examples: [2023],
    }),
  }),
};
