# RFC 0002 — Divisão em quatro repositórios

- Status: Aceita (desenho). Implementação ainda não começou.
- Autores: grupo Bunzina
- ADR: [0009](../adrs/0009-four-repositories.md)

## Problema

Hoje `bunzina` concentra API, migrations, Terraform de VPC/EKS/ECR e o umbrella Helm. O PDF exige quatro repos com CI/CD próprio. O professor autorizou manter `bunzina-chart` e as migrations na aplicação.

## Decisão

```
bunzina                 aplicação + migrations + umbrella + CI de deploy
bunzina-lambda          Function Auth + API Gateway + CI de deploy serverless
bunzina-infra           Terraform de VPC, EKS, node group, addons, ECR
bunzina-db              Terraform do PostgreSQL no EKS
bunzina-chart           (extra) chart genérico OCI
```

### O que sai deste repositório

`infra/*.tf` e o workflow `terraform.yml` ficam no `bunzina-infra`. O repositório da aplicação consome o cluster por kubeconfig e `helm upgrade`.

### O que fica

- Código da API e testes
- `migrations/` e o engine
- `charts/bunzina-chart`
- Workflows de lint, teste, migrate e deploy da aplicação

### CI/CD mínimo de cada repo

| Repo | PR | `main` (após approve) |
| --- | --- | --- |
| `bunzina` | lint + testes | migrate + image + helm (já existe) |
| `bunzina-lambda` | testes da Function | deploy da Lambda/Gateway |
| `bunzina-infra` | `terraform plan` comentado | `apply` manual no environment `production` |
| `bunzina-db` | `terraform plan` | `apply` manual no environment `production` |

Branch `main` protegida, sem commit direto, em todos. Sem ambiente/branch de homologação — o professor dispensou.

### State Terraform

Um bucket (ou prefixos) por repo:

- `infra/terraform.tfstate` no `bunzina-infra`
- `infra/terraform.tfstate` no `bunzina-db`

Lock nativo do S3, como já fazemos.

### README dos outros repos

Não repetir diagramas. Linkar `docs/arch/` neste repositório.

## Ordem de extração

1. Manter `bunzina-infra` com o conteúdo de infraestrutura de VPC/EKS (state push se necessário)
2. Manter `bunzina-db` com o PostgreSQL no EKS (ADR-001 de provisionamento)
3. Criar `bunzina-lambda` com o esqueleto da Function
4. Proteção de `main` + PR obrigatório
5. Só então apontar o Gateway para o EKS já existente

## Alternativas rejeitadas

| Opção | Por que não |
| --- | --- |
| Monorepo com quatro pastas | Não atende “quatro repositórios” |
| Migrations no repo de banco | O professor aceitou deixá-las na app; o engine já está acoplado ao Bun |
| Gateway no repo de K8s | Possível, mas a Lambda e o Gateway mudam juntos — ficam no repo da Lambda |
