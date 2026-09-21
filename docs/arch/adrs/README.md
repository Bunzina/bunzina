# Architecture Decision Records

Cada ADR registra uma decisão e o motivo. Status: **Aceita** (já vale no código/infra), **Proposta** (ainda não adotada) ou **Proposta substituída** (histórico preservado, com referência à decisão vigente).

| ADR | Decisão | Status |
| --- | --- | --- |
| [0001](./0001-postgresql.md) | PostgreSQL como banco | Aceita |
| [0002](./0002-clean-architecture.md) | Clean Architecture sem ORM | Aceita |
| [0003](./0003-bun-elysia-runtime.md) | Bun + Elysia | Aceita |
| [0004](./0004-jwt-hs256.md) | JWT HS256 na API, sem refresh token | Aceita |
| [0005](./0005-eks-application.md) | Aplicação no EKS, não em Lambda | Aceita |
| [0006](./0006-helm-umbrella.md) | Helm umbrella + chart genérico | Aceita |
| [0007](./0007-custom-migrations.md) | Engine próprio de migrations | Aceita |
| [0008](./0008-scalability.md) | Valores de HPA e node group | Aceita |
| [0009](./0009-four-repositories.md) | Separação de repositórios | Aceita |
| [0010](./0010-lambda-auth-api-gateway.md) | Lambda de login + API Gateway | Aceita |
| [0011](./0011-managed-database.md) | Proposta de banco gerenciado → PostgreSQL no EKS | Proposta substituída |
| [0012](./0012-microservices-split.md) | Recorte dos microsserviços da Fase 4 | Aceita |
| [0013](./0013-orchestrated-saga.md) | Saga orquestrada com o `bunzina-os` no comando | Aceita |
| [0014](./0014-mongodb-workshop.md) | MongoDB Atlas no `bunzina-workshop` | Aceita |
| [0015](./0015-rabbitmq-broker.md) | RabbitMQ como broker de mensageria | Aceita |
| [0016](./0016-code-reuse-between-services.md) | Reuso de código entre os microsserviços | Aceita |
| [0017](./0017-sonarcloud-quality-gate.md) | SonarCloud como quality gate | Aceita |

A decisão vigente de provisionamento do banco está na [ADR-001 — PostgreSQL no EKS com Terraform](../../adrs/adr-001-postgresql-terraform.md), aceita em 2026-09-13.

As mensagens trocadas entre os serviços da Fase 4 estão em [Contratos de eventos da saga](../../contracts/events-saga-contracts.md).
