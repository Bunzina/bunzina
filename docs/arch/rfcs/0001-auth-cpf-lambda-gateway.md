# RFC 0001 — Autenticação com CPF, Lambda e API Gateway

- Status: Aceita (desenho). Implementação ainda não começou.
- Autores: grupo Bunzina
- ADRs: [0004](../adrs/0004-jwt-hs256.md), [0010](../adrs/0010-lambda-auth-api-gateway.md)

## Problema

O login atual (`POST /auth/login`) só valida e-mail e senha. O PDF da Fase 3 exige:

1. CPF no fluxo, validado e associado ao usuário
2. Uma Function Serverless que valide o CPF, consulte existência/status e emita JWT
3. API Gateway na frente, validando o token antes dos serviços internos

Não podemos implementar só uma das três etapas da Function.

## Decisão

### Contrato

`POST /auth` no Gateway → Lambda, público.

```json
{ "document": "12345678909", "email": "user@bunzina.com", "password": "…" }
```

Resposta de sucesso: `{ "token": "<jwt>" }`. Falha de credencial/CPF/status: **401** com a mesma mensagem (`Invalid credentials`), para não vazar se o CPF existe. CPF malformado: **400**.

### Dentro da Function (três etapas, três funções)

1. `validateDocument(document)` — mesmos dígitos do helper da API
2. `findAuthPrincipal(document, email)` — usuário ativo + cliente associado ao CPF; status relevante é `users.is_active` (e, se houver, o cadastro do cliente)
3. `issueJwt(principal)` — HS256 com `sub`, `email`, `role`, `document`

E-mail e senha continuam. O CPF é obrigatório e tem de bater com o usuário.

### Associação CPF ↔ usuário

Nova migration na aplicação (não no repo de infra de banco):

- `users.document` único (nullable para admin/mecânico legado)
- `users.customer_id` FK opcional para `customers`
- Role `CUSTOMER`: `document` obrigatório e igual a `customers.document`

### Gateway

| Rota | Destino | JWT no Gateway |
| --- | --- | --- |
| `POST /auth` | Lambda | não |
| `GET /health` | EKS | não |
| `GET /service-orders/customer/{document}` | EKS | não (consulta pública por CPF) |
| `POST /users` | EKS | não (cadastro CUSTOMER) |
| Demais | EKS | sim |

A API mantém o middleware atual como segunda trincheira e continua dona do RBAC.

### Onde vive o código

Repo `bunzina-lambda`. Gateway no mesmo repo (Terraform ou Serverless Framework). Secret JWT compartilhada com o EKS.

## Alternativas rejeitadas

| Opção | Por que não |
| --- | --- |
| Só acrescentar CPF no login da Elysia | Não entrega Function Serverless |
| Três Lambdas (validar / consultar / assinar) | O PDF pede uma Function com as três etapas |
| Kong no cluster | Tráfego sem token ainda entra no EKS |
| Identificar o usuário **só** pelo CPF, sem senha | Frágil; o PDF permite e-mail+senha desde que o CPF entre no fluxo |

## Impacto

- Quebra o contrato de `POST /auth/login` (sem `document`) — versionar ou manter a rota antiga temporariamente
- Seed/admin de demo precisa de CPF
- Mentoria: levar este RFC + [diagrama](../diagrams/api-gateway-lambda.md) antes do deploy definitivo
