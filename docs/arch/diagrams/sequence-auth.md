# Sequência — autenticação

Login por CPF com validação inicial na Lambda e emissão de JWT na API.

![Sequência de autenticação](../sequence-auth.png)

Fonte editável: [sequence-auth.svg](../sequence-auth.svg).

## Fluxo

1. Cliente envia `POST /auth/login` com `{ document, password }` ao API Gateway.
2. Gateway encaminha a requisição para a Lambda, que valida o payload e o CPF.
3. Lambda chama a API via Axios, usando `BUNZINA_API_BASE_URL` e a rota `/auth/login`.
4. A API busca o usuário por `users.document`, verifica `is_active` e valida a senha com `Bun.password.verify`.
5. A API assina um JWT HS256 com `sub`, `document`, `email`, `role`, `iat` e `exp` e retorna `{ token }`.
6. Lambda repassa o status HTTP e o corpo da resposta ao Gateway, que responde ao cliente.
7. Para acessar uma rota protegida, o cliente chama o ALB com Bearer JWT. O middleware da API valida o token.

A Lambda retorna `400` para entrada inválida, repassa os erros HTTP da API e
retorna `502` quando não obtém resposta do serviço. Credenciais incorretas ou
usuário inativo são rejeitados pela API com `401`.

## Fontes

- [Schema de login da API](../../../src/adapters/input/user/validations/login-schema.ts)
- [Caso de uso de login](../../../src/application/use-cases/user/login.ts)
- [Assinatura e validação do JWT](../../../src/infrastructure/services/jwt.ts)
- [RFC 0001](../rfcs/0001-auth-cpf-lambda-gateway.md)
- Projeto `bunzina-lambda`: `serverless.yml` e `src/infrastructure/services/bunzina-auth-service.ts`.
