# ADR 0011 — Proposta de banco gerenciado e decisão por PostgreSQL no EKS

- Status: Proposta substituída
- Decisão vigente: [ADR-001 — PostgreSQL no EKS com Terraform](../../adrs/adr-001-postgresql-terraform.md)
- RFC relacionada: [0003](../rfcs/0003-managed-database.md)

## Histórico da decisão

Inicialmente, consideramos Amazon RDS PostgreSQL para ter um banco gerenciado
fora do cluster. Essa proposta foi discutida na [RFC 0003](../rfcs/0003-managed-database.md).

Depois, optamos por manter o PostgreSQL no EKS e separar seu provisionamento
no repositório `bunzina-db`. A decisão foi formalizada em 2026-09-13 pela
[ADR-001 de provisionamento](../../adrs/adr-001-postgresql-terraform.md).

Os motivos registrados nessa ADR foram aproveitar o PostgreSQL já utilizado no
EKS, evitar duplicar o banco e os custos de RDS, e separar o ciclo de vida do
banco do deploy da API. Em contrapartida, backup, restauração, atualização e
disponibilidade ficam sob responsabilidade da equipe.

Este histórico registra uma mudança de proposta arquitetural, não uma migração
de dados de uma instância RDS para o EKS.

## Decisão vigente

O banco é PostgreSQL 15 executado no cluster EKS. A ADR-001 aceita atribui seu
provisionamento ao repositório `bunzina-db`, usando Terraform para criar os
recursos Kubernetes no namespace `bunzina`:

- Deployment com uma réplica de `postgres:15`;
- Service `ClusterIP` chamado `postgres`, na porta `5432`;
- PVC com armazenamento EBS `gp3`;
- recursos de credenciais conforme a ADR de provisionamento.

A aplicação acessa o Service do banco. A Lambda chama a API e não acessa o
PostgreSQL diretamente. As migrations permanecem no repositório `bunzina`.

## Consequências

- O PostgreSQL no EKS é o banco da solução.
- O banco tem ciclo de vida separado do chart da API, sob responsabilidade do `bunzina-db`.
- Backup, restauração, atualizações e disponibilidade são responsabilidades da equipe.
- A configuração `DB_HOST` permite selecionar o endereço do Service Kubernetes do banco.

Os critérios de provisionamento e validação estão na [ADR-001](../../adrs/adr-001-postgresql-terraform.md).
