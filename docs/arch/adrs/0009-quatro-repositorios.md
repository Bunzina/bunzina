# ADR 0009 — Quatro repositórios com CI/CD

- Status: Proposta
- Data: Fase 3
- RFC: [0002](../rfcs/0002-repository-split.md)

## Contexto

O PDF exige quatro repositórios, cada um com CI/CD, branch principal protegida e merge só por PR:

1. Lambda
2. Infraestrutura Kubernetes
3. Infraestrutura do banco gerenciado
4. Aplicação principal no Kubernetes

Já existem `bunzina` (app + Terraform do EKS + migrations) e `bunzina-chart`.

## Decisão

Criar os repos que faltam e **esvaziar** `infra/` deste repositório depois da extração. Manter `bunzina-chart`. Migrations **ficam na aplicação**.

| Repositório | Conteúdo | Pipeline |
| --- | --- | --- |
| `bunzina-lambda` | Function de auth + (opcional) API Gateway em Terraform/Serverless | test → package → deploy Lambda |
| `bunzina-infra-k8s` | Terraform atual de VPC/EKS/ECR/addons | plan em PR, apply manual |
| `bunzina-infra-db` | Terraform do PostgreSQL gerenciado | plan em PR, apply manual |
| `bunzina` | API, migrations, umbrella Helm | já existe: test → migrate → build → helm |
| `bunzina-chart` | Chart genérico (extra) | já existe |

## Motivo

- Um pipeline por tipo de mudança (auth ≠ nodes ≠ schema de instância ≠ código)
- State do Terraform separado (K8s vs banco)
- O professor aceitou manter o chart e as migrations na aplicação

## Consequências

- Quatro (cinco) PRs para uma feature transversal — documentar a ordem no README de cada repo
- Secrets AWS repetidos no Academy (session token gira)
- Este repo deixa de ser a fonte da infra de cluster
