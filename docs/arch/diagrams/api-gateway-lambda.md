# API Gateway e Lambda

O API Gateway encaminha o login para a Lambda. A Lambda valida o CPF e chama a API no EKS, que autentica o usuário e gera o JWT. A Lambda devolve o status HTTP e o corpo da resposta desse serviço.

![API Gateway e Lambda Auth](../api-gateway-lambda.png)

## Responsabilidades

### API Gateway

- Roteia `POST /auth/login` para a Lambda, conforme `bunzina-lambda/serverless.yml`.
- Essa é a única rota declarada no HTTP API; as demais rotas da aplicação são acessadas pelo EKS.
- Não há configuração explícita de validação de JWT, CORS ou rate limit customizado nesse arquivo.

### Lambda Auth

1. Recebe `document` e `password` e valida o formato da requisição e os dígitos verificadores do CPF.
2. Chama `POST /auth/login` da API no EKS via Axios, enviando os dados validados.
3. Devolve o status HTTP e o corpo da resposta da API, incluindo respostas de erro.

A Lambda não consulta diretamente o banco nem gera o JWT. Se não conseguir obter uma resposta do serviço de autenticação, retorna `502`.

### API Bunzina no EKS

- Busca o usuário por documento e valida senha e status.
- Gera o JWT e retorna a resposta de autenticação para a Lambda.

## Contrato de login

```http
POST /auth/login
Content-Type: application/json

{
  "document": "12345678909",
  "password": "********"
}
```

O corpo da resposta de autenticação é definido pela API no EKS e repassado pela Lambda.

| Situação | Resposta |
| --- | --- |
| JSON inválido, CPF inválido ou dados fora do schema | 400 |
| Resposta do serviço no EKS, incluindo erros de autenticação | Mesmo status HTTP e corpo retornados pelo serviço |
| Falha de comunicação sem resposta do serviço | 502 |

## Referências da implementação

Arquivos no projeto `bunzina-lambda`:

- `serverless.yml`: rota do API Gateway.
- `src/adapters/input/validations/login-schema.ts`: contrato de entrada.
- `src/adapters/input/login.ts`: validação e construção da resposta.
- `src/infrastructure/services/bunzina-auth-service.ts`: chamada à API e tratamento de falhas.
