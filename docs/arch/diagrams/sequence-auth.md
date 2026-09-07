# Sequência — autenticação

CPF no login, Lambda executando as três etapas, Gateway barrando token inválido. A API no EKS **mantém** a segunda validação do JWT e o RBAC.

![Sequência de autenticação](../sequence-auth.png)

## Fluxo atual (Fases 1 e 2)

Login só com e-mail e senha, JWT emitido pela API no EKS.

1. `POST /auth/login` com `{ email, password }`
2. `LoginUseCase` busca o usuário, verifica senha e `is_active`
3. `signJwt` devolve HS256 (`sub`, `email`, `role`)
4. Rotas protegidas passam pelo middleware `verifyJwt` (ou `Api-Key` para webhook)

## Fluxo-alvo da Fase 3

1. Cliente envia `POST /auth` com `{ document, email, password }`
2. API Gateway encaminha para a Lambda, sem JWT
3. Lambda valida CPF, consulta usuário/cliente/status no PostgreSQL e emite o JWT
4. Nas rotas protegidas o Gateway valida o token **antes** de chegar no EKS
