import { createServiceSchema } from '@/adapters/input/service/validations/create-service-schema';
import { deleteServiceSchema } from '@/adapters/input/service/validations/delete-service-schema';
import { findServiceSchema } from '@/adapters/input/service/validations/find-service-schema';

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
};

export const findServiceRouteSchema = {
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
  params: findServiceSchema,
};

export const deleteServiceRouteSchema = {
  detail: {
    tags: ['Services'],
    summary: 'Deletar serviço',
    description: 'Deleta um serviço pelo ID fornecido.',
    responses: {
      '200': { description: 'Serviço deletado com sucesso' },
      '400': { description: 'ID inválido' },
      '401': { description: 'Token ausente ou inválido' },
      '404': { description: 'Serviço não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: deleteServiceSchema,
};
