import { t } from 'elysia';

const userRoleSchema = t.Union([
  t.Literal('ADMIN'),
  t.Literal('MECHANIC'),
  t.Literal('CUSTOMER'),
]);

const userResponseSchema = t.Object({
  id: t.String({ format: 'uuid' }),
  name: t.String(),
  document: t.String({ examples: ['11144477735'] }),
  email: t.String({ format: 'email' }),
  role: userRoleSchema,
  isActive: t.Boolean(),
  createdAt: t.String({ format: 'date' }),
  updatedAt: t.String({ format: 'date' }),
});

const loginResponseSchema = t.Object({
  token: t.String(),
});

export const loginSchema = {
  detail: {
    tags: ['Auth'],
    summary: 'Login',
    description: 'Autentica um usuário e retorna um token JWT.',
    responses: {
      '200': { description: 'Login realizado com sucesso' },
      '400': { description: 'Dados inválidos' },
      '401': { description: 'Credenciais inválidas' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  body: t.Object({
    document: t.String({ examples: ['11144477735'] }),
    password: t.String({ examples: ['senha123'] }),
  }),
  response: {
    200: loginResponseSchema,
  },
};

export const createUserSchema = {
  detail: {
    tags: ['Users'],
    summary: 'Criar usuário',
    description:
      'Cria um novo usuário no sistema. Para role CUSTOMER, não é necessário autenticação. Para ADMIN ou MECHANIC, é obrigatório enviar um token JWT válido no header Authorization.',
    responses: {
      '201': { description: 'Usuário criado com sucesso' },
      '400': { description: 'Dados inválidos' },
      '401': {
        description:
          'Token ausente ou inválido (apenas para roles ADMIN e MECHANIC)',
      },
      '409': { description: 'Usuário já existe' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  body: t.Object({
    name: t.String({ examples: ['João Silva'] }),
    document: t.String({ examples: ['11144477735'] }),
    email: t.String({ format: 'email', examples: ['joao@bunzina.com'] }),
    password: t.String({
      description: 'Senha com no mínimo 6 caracteres',
      examples: ['senha123'],
    }),
    role: t.String({
      description: 'ADMIN | MECHANIC | CUSTOMER',
      examples: ['MECHANIC'],
    }),
  }),
  response: {
    201: userResponseSchema,
  },
};

export const findUserSchema = {
  detail: {
    tags: ['Users'],
    summary: 'Buscar usuário',
    description: 'Busca um usuário pelo ID.',
    responses: {
      '200': { description: 'Usuário encontrado' },
      '404': { description: 'Usuário não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'UUID do usuário',
      examples: ['550e8400-e29b-41d4-a716-446655440000'],
    }),
  }),
  response: {
    200: userResponseSchema,
  },
};

export const updateUserSchema = {
  detail: {
    tags: ['Users'],
    summary: 'Atualizar usuário',
    description: 'Atualiza os dados de um usuário existente.',
    responses: {
      '200': { description: 'Usuário atualizado com sucesso' },
      '400': { description: 'Dados inválidos' },
      '404': { description: 'Usuário não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'UUID do usuário',
      examples: ['550e8400-e29b-41d4-a716-446655440000'],
    }),
  }),
  body: t.Object({
    name: t.String({ examples: ['João Silva'] }),
    document: t.String({ examples: ['11144477735'] }),
    email: t.String({ format: 'email', examples: ['joao@bunzina.com'] }),
    role: t.String({
      description: 'ADMIN | MECHANIC | CUSTOMER',
      examples: ['MECHANIC'],
    }),
    isActive: t.Boolean({ examples: [true] }),
  }),
  response: {
    200: userResponseSchema,
  },
};

export const deleteUserSchema = {
  detail: {
    tags: ['Users'],
    summary: 'Excluir usuário',
    description: 'Exclui um usuário pelo ID.',
    responses: {
      '204': { description: 'Usuário excluído com sucesso' },
      '404': { description: 'Usuário não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    id: t.String({
      description: 'UUID do usuário',
      examples: ['550e8400-e29b-41d4-a716-446655440000'],
    }),
  }),
};
