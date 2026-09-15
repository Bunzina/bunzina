# ADR 0009 — Separação de repositórios

- Status: Aceita
- RFC: [0002](../rfcs/0002-repository-split.md)

## Decisão

Separar aplicação, login serverless, infraestrutura do cluster e infraestrutura
do banco. Manter o chart genérico em um quinto repositório.

| Repositório | Responsabilidade |
| --- | --- |
| `bunzina` | API, testes, migrations, umbrella e deploy da aplicação |
| `bunzina-lambda` | Lambda de login e API Gateway |
| `bunzina-infra` | Rede, EKS, nós, addons e ECR |
| `bunzina-db` | PostgreSQL no EKS, armazenamento e credenciais |
| `bunzina-chart` | Templates reutilizáveis do chart `app-chart` |

## Motivo

A separação permite evoluir o banco e a infraestrutura sem associar seu ciclo
de vida ao rollout da API. As migrations permanecem junto do código que depende
do schema.

## Consequências

- Cada repositório controla seus testes e sua entrega.
- States de infraestrutura e banco usam keys distintas, conforme a [ADR de provisionamento](../../adrs/adr-001-postgresql-terraform.md).
- A instalação respeita a ordem cluster → banco → aplicação.
- A documentação de arquitetura é centralizada em `bunzina/docs/arch`.

O `bunzina-db` lê o output `cluster_name` do state de `bunzina-infra` em S3.
O bucket é informado por `infra_state_bucket`; a key, por `infra_state_key`.
