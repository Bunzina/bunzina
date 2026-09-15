# ADR 0010 — Lambda de login e API Gateway

- Status: Aceita
- RFC: [0001](../rfcs/0001-auth-cpf-lambda-gateway.md)

## Contexto

A aplicação principal já concentra a autenticação e a geração de JWT. A entrada
serverless de login permite incorporar API Gateway e Lambda sem duplicar essas
regras ou o acesso ao banco.

## Decisão

- API Gateway HTTP API expõe somente `POST /auth/login`.
- Lambda recebe `{ document, password }`, valida o CPF e chama a API via Axios.
- A API busca o usuário por documento, valida senha e status e emite o JWT.
- A Lambda repassa status e body, incluindo erros HTTP retornados pela API.
- Rotas de negócio são atendidas pelo ALB/EKS; o middleware da API autentica as requisições.
- Lambda e Gateway são mantidos no repositório `bunzina-lambda`.

## Consequências

- A API continua responsável por banco, credenciais e JWT.
- A Lambda depende da disponibilidade da API e retorna `502` quando não obtém resposta.
- O segredo de assinatura JWT pertence à API; a Lambda não precisa assiná-lo ou verificá-lo.

## Alternativas consideradas

Autenticar ou gerar JWT na Lambda duplicaria lógica da aplicação. Mapear todas
as rotas no Gateway ampliaria o escopo além do login definido para esta etapa.
