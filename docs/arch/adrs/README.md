# Architecture Decision Records

Cada ADR registra uma decisão e o motivo. Status: **Aceita** (já vale no código/infra) ou **Proposta** (Fase 3, ainda não implementada).

| ADR | Decisão | Status |
| --- | --- | --- |
| [0001](./0001-postgresql.md) | PostgreSQL como banco | Aceita |
| [0002](./0002-clean-architecture.md) | Clean Architecture sem ORM | Aceita |
| [0003](./0003-runtime-bun-elysia.md) | Bun + Elysia | Aceita |
| [0004](./0004-jwt-hs256.md) | JWT HS256 na API, sem refresh token | Aceita |
| [0005](./0005-eks-aplicacao.md) | Aplicação no EKS, não em Lambda | Aceita |
| [0006](./0006-helm-umbrella.md) | Helm umbrella + chart genérico | Aceita |
| [0007](./0007-migrations-proprias.md) | Engine próprio de migrations | Aceita |
| [0008](./0008-escalabilidade.md) | Valores de HPA e node group | Aceita |
| [0009](./0009-quatro-repositorios.md) | Quatro repositórios com CI/CD | Proposta |
| [0010](./0010-lambda-auth-api-gateway.md) | Lambda de auth + API Gateway | Proposta |
| [0011](./0011-banco-gerenciado.md) | PostgreSQL gerenciado fora do cluster | Proposta |
