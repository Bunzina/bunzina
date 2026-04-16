import { createServiceSchema } from '@/adapters/input/service/validations/create-service-schema';

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
