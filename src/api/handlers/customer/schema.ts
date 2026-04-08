import { t } from 'elysia';

const addressSchema = t.Object({
  street: t.String({ examples: ['Av. Paulista'] }),
  number: t.String({ examples: ['1000'] }),
  neighborhood: t.String({ examples: ['Bela Vista'] }),
  city: t.String({ examples: ['São Paulo'] }),
  state: t.String({ examples: ['SP'] }),
  zipCode: t.String({ examples: ['01310-100'] }),
  complement: t.Optional(t.String({ examples: ['Sala 101'] })),
});

export const createCustomerSchema = {
  detail: {
    tags: ['Customers'],
    summary: 'Criar cliente',
    description: 'Cria um novo cliente com CPF ou CNPJ.',
    requestBody: {
      content: {
        'application/json': {
          examples: {
            CPF: {
              summary: 'Cliente pessoa física (CPF)',
              value: {
                name: 'João Silva',
                document: '123.456.789-09',
                email: 'joao@email.com',
                phone: '+5511999999999',
                address: {
                  street: 'Rua das Flores',
                  number: '42',
                  neighborhood: 'Centro',
                  city: 'São Paulo',
                  state: 'SP',
                  zipCode: '01310-100',
                  complement: 'Apto 3',
                },
              },
            },
            CNPJ: {
              summary: 'Cliente pessoa jurídica (CNPJ)',
              value: {
                name: 'Empresa LTDA',
                document: '45.723.174/0001-10',
                email: 'contato@empresa.com',
                phone: '+551133334444',
                address: {
                  street: 'Av. Paulista',
                  number: '1000',
                  neighborhood: 'Bela Vista',
                  city: 'São Paulo',
                  state: 'SP',
                  zipCode: '01310-100',
                  complement: 'Sala 101',
                },
              },
            },
          },
        },
      },
    },
    responses: {
      '201': { description: 'Cliente criado com sucesso' },
      '400': { description: 'Dados inválidos (CPF/CNPJ ou e-mail inválido)' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  body: t.Object({
    name: t.String({ examples: ['João Silva'] }),
    document: t.String({
      description: 'CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00)',
      examples: ['123.456.789-09'],
    }),
    email: t.String({ format: 'email', examples: ['joao@email.com'] }),
    phone: t.String({
      description: 'Telefone com código do país',
      examples: ['+5511999999999'],
    }),
    address: addressSchema,
  }),
};

export const findCustomerSchema = {
  detail: {
    tags: ['Customers'],
    summary: 'Buscar cliente',
    description: 'Busca um cliente pelo número do documento (CPF ou CNPJ).',
    responses: {
      '200': { description: 'Cliente encontrado' },
      '404': { description: 'Cliente não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    documentNumber: t.String({
      description: 'CPF ou CNPJ sem formatação',
      examples: ['12345678909'],
    }),
  }),
};

export const updateCustomerSchema = {
  detail: {
    tags: ['Customers'],
    summary: 'Atualizar cliente',
    description: 'Atualiza os dados de um cliente existente pelo número do documento.',
    responses: {
      '200': { description: 'Cliente atualizado com sucesso' },
      '400': { description: 'Dados inválidos' },
      '404': { description: 'Cliente não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    documentNumber: t.String({
      description: 'CPF ou CNPJ sem formatação',
      examples: ['12345678909'],
    }),
  }),
  body: t.Object({
    name: t.String({ examples: ['João Silva'] }),
    email: t.String({ format: 'email', examples: ['joao@email.com'] }),
    phone: t.String({
      description: 'Telefone com código do país',
      examples: ['+5511999999999'],
    }),
    address: addressSchema,
  }),
};

export const deleteCustomerSchema = {
  detail: {
    tags: ['Customers'],
    summary: 'Excluir cliente',
    description: 'Exclui um cliente pelo número do documento (CPF ou CNPJ).',
    responses: {
      '204': { description: 'Cliente excluído com sucesso' },
      '404': { description: 'Cliente não encontrado' },
      '500': { description: 'Erro interno do servidor' },
    },
  },
  params: t.Object({
    documentNumber: t.String({
      description: 'CPF ou CNPJ sem formatação',
      examples: ['12345678909'],
    }),
  }),
};
