import { t } from 'elysia';

const autoPartResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String(),
  description: t.String(),
  price: t.Number(),
  stock: t.Number(),
  createdAt: t.String({ format: 'date-time' }),
  updatedAt: t.String({ format: 'date-time' }),
});

const autoPartsListResponseSchema = t.Object({
  data: t.Array(autoPartResponseSchema),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
  }),
});

const stockMovementResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  autoPartId: t.String({ format: 'uuid' }),
  quantity: t.Number(),
  type: t.Union([t.Literal('IN'), t.Literal('OUT')]),
  serviceOrderId: t.Optional(t.String({ format: 'uuid' })),
  createdAt: t.String({ format: 'date-time' }),
});

const stockMovementsListResponseSchema = t.Object({
  data: t.Array(stockMovementResponseSchema),
  pagination: t.Object({
    page: t.Number(),
    limit: t.Number(),
  }),
});

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
  response: {
    201: autoPartResponseSchema,
  },
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
  response: {
    200: autoPartsListResponseSchema,
  },
};

export const listStockMovementsRouteSchema = {
  detail: {
    tags: ['Auto-Parts'],
    summary: 'Consultar movimentações',
    description:
      'Lista o histórico de movimentações de estoque de uma peça ou insumo com paginação.',
    responses: {
      '200': { description: 'Movimentações retornadas com sucesso' },
      '400': { description: 'Parâmetros inválidos' },
      '404': { description: 'Peça não encontrada' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'ID da peça para consultar movimentações',
      format: 'uuid',
    }),
  }),
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
  }),
  response: {
    200: stockMovementsListResponseSchema,
  },
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
  response: {
    200: autoPartResponseSchema,
  },
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
  response: {
    200: autoPartResponseSchema,
  },
};

export const deleteAutoPartRouteSchema = {
  detail: {
    tags: ['Auto-Parts'],
    summary: 'Desativar peça',
    description:
      'Desativa uma peça ou insumo por ID utilizando soft delete no estoque.',
    responses: {
      '204': { description: 'Peça desativada com sucesso' },
      '400': { description: 'ID inválido' },
      '404': { description: 'Peça não encontrada' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'ID da peça a ser desativada',
      format: 'uuid',
    }),
  }),
};
