import { t } from 'elysia';

export const createAutoPartSchema = {
  detail: {
    tags: ['Auto-Parts'],
    summary: 'Criar peça/insumo',
    description: 'Cria uma nova peça ou insumo no estoque da oficina.',
    requestBody: {
      content: {
        'application/json': {
          example: {
            name: 'Filtro de Óleo',
            description: 'Filtro para óleo do motor',
            price: 4500,
            stock: 10,
          },
        },
      },
    },
    responses: {
      '201': { description: 'Peça criada com sucesso' },
      '400': { description: 'Dados inválidos' },
      '409': { description: 'Peça já existe' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  body: t.Object({
    name: t.String({
      description: 'Nome da peça ou insumo',
      examples: ['Filtro de Óleo'],
    }),
    description: t.String({
      description: 'Descrição detalhada da peça',
      examples: ['Filtro para óleo do motor'],
    }),
    price: t.Number({
      description: 'Preço em centavos',
      examples: [4500],
    }),
    stock: t.Number({
      description: 'Quantidade em estoque',
      examples: [10],
    }),
  }),
};

export const listAutoPartsRouteSchema = {
  detail: {
    tags: ['Auto-Parts'],
    summary: 'Listar peças',
    description:
      'Lista peças e insumos com paginação e filtro opcional por nome.',
    responses: {
      '200': { description: 'Lista de peças retornada com sucesso' },
      '400': { description: 'Parâmetros inválidos' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  query: t.Object({
    page: t.String({
      description: 'Número da página',
      minimum: '1',
      examples: ['1'],
    }),
    limit: t.String({
      description: 'Quantidade de itens por página',
      minimum: '1',
      maximum: '100',
      examples: ['20'],
    }),
    name: t.Optional(
      t.String({
        description: 'Filtro por nome da peça (busca parcial)',
      }),
    ),
  }),
};

export const updateAutoPartRouteSchema = {
  detail: {
    tags: ['Auto-Parts'],
    summary: 'Atualizar peça',
    description: 'Atualiza uma peça ou insumo existente.',
    responses: {
      '200': { description: 'Peça atualizada com sucesso' },
      '400': { description: 'Dados inválidos' },
      '404': { description: 'Peça não encontrada' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'ID da peça a ser atualizada',
      format: 'uuid',
    }),
  }),
  body: t.Object({
    name: t.String({
      description: 'Nome da peça ou insumo',
    }),
    description: t.String({
      description: 'Descrição detalhada da peça',
    }),
    price: t.Number({
      description: 'Preço em centavos',
    }),
    stock: t.Number({
      description: 'Quantidade em estoque',
    }),
  }),
};

export const findAutoPartRouteSchema = {
  detail: {
    tags: ['Auto-Parts'],
    summary: 'Buscar peça por ID',
    description: 'Busca uma peça ou insumo pelo ID informado.',
    responses: {
      '200': { description: 'Peça encontrada com sucesso' },
      '400': { description: 'ID inválido' },
      '404': { description: 'Peça não encontrada' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'ID da peça a ser buscada',
      format: 'uuid',
    }),
  }),
};
