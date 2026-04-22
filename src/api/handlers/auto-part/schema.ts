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
