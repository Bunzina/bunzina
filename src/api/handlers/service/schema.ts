import { createServiceSchema } from '@/adapters/input/service/validations/create-service-schema';
import { deleteServiceSchema } from '@/adapters/input/service/validations/delete-service-schema';
import { findServiceByIdSchema } from '@/adapters/input/service/validations/find-service-by-id-schema';
import { t } from 'elysia';

const serviceResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String({ description: 'Nome do serviço' }),
  description: t.String({ description: 'Descrição do serviço' }),
  price: t.Number({ description: 'Preço do serviço' }),
  durationInMinutes: t.Number({ description: 'Duração em minutos' }),
  completedCount: t.Number({ description: 'Quantidade de vezes concluído' }),
  totalExecutionTimeMs: t.Number({
    description: 'Tempo total de execução em ms',
  }),
  averageExecutionTimeMs: t.Union([
    t.Number({ description: 'Tempo médio de execução em ms' }),
    t.Null(),
  ]),
  createdAt: t.String({ format: 'date-time' }),
  updatedAt: t.String({ format: 'date-time' }),
});

export const createServiceRouteSchema = {
  detail: {
    tags: ['Services'],
    summary: 'Criar serviço',
    description: 'Cria um novo serviço com os dados fornecidos.',
    responses: {
      '201': { description: 'Serviço criado com sucesso' },
      '400': { description: 'Dados inválidos' },
      '401': { description: 'Token ausente ou inválido' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  body: createServiceSchema,
  response: {
    201: serviceResponseSchema,
  },
};

export const findServiceByIdRouteSchema = {
  detail: {
    tags: ['Services'],
    summary: 'Encontrar serviço',
    description: 'Busca um serviço pelo ID fornecido.',
    responses: {
      '200': { description: 'Serviço encontrado com sucesso' },
      '400': { description: 'ID inválido' },
      '401': { description: 'Token ausente ou inválido' },
      '404': { description: 'Serviço não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: findServiceByIdSchema,
  response: {
    200: serviceResponseSchema,
  },
};

export const deleteServiceRouteSchema = {
  detail: {
    tags: ['Services'],
    summary: 'Deletar serviço',
    description: 'Deleta um serviço pelo ID fornecido.',
    responses: {
      '204': { description: 'Serviço deletado com sucesso' },
      '400': { description: 'ID inválido' },
      '401': { description: 'Token ausente ou inválido' },
      '404': { description: 'Serviço não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: deleteServiceSchema,
};

export const updateServiceRouteSchema = {
  detail: {
    tags: ['Services'],
    summary: 'Atualizar serviço',
    description: 'Atualiza um serviço.',
    responses: {
      '200': { description: 'Serviço atualizado com sucesso' },
      '400': { description: 'Dados inválidos' },
      '401': { description: 'Token ausente ou inválido' },
      '404': { description: 'Serviço não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'ID do serviço a ser atualizado',
      format: 'uuid',
    }),
  }),
  body: t.Object({
    name: t.String({ description: 'Nome do serviço' }),
    description: t.String({ description: 'Descrição do serviço' }),
    price: t.Number({ description: 'Preço do serviço' }),
    durationInMinutes: t.Number({
      description: 'Duração do serviço em minutos',
    }),
    isActive: t.Boolean({ description: 'Indica se o serviço está ativo' }),
  }),
  response: {
    200: serviceResponseSchema,
  },
};
