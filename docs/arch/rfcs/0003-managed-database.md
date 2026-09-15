# RFC 0003 — Proposta de banco gerenciado e encaminhamento para PostgreSQL no EKS

- Status: Proposta original substituída
- Decisão vigente: [ADR-001 — PostgreSQL no EKS com Terraform](../../adrs/adr-001-postgresql-terraform.md)
- ADR relacionada: [0011](../adrs/0011-managed-database.md)

## Encaminhamento da proposta

Esta RFC inicialmente propunha Amazon RDS PostgreSQL. A decisão posterior foi
manter PostgreSQL no EKS, provisionado pelo `bunzina-db`. O histórico e os motivos
dessa mudança estão no [ADR 0011](../adrs/0011-managed-database.md#historico-da-decisao);
a especificação vigente está na [ADR-001 de provisionamento](../../adrs/adr-001-postgresql-terraform.md).

As seções abaixo descrevem o encaminhamento adotado para o banco e as migrations.

## Arquitetura adotada

O `bunzina-db` é responsável pelo provisionamento do PostgreSQL 15 no EKS via
Terraform. A decisão aceita define um Deployment de uma réplica, Service
`postgres:5432`, PVC `gp3` e recursos de credenciais no namespace `bunzina`.
O chart da aplicação consome o banco existente e não deve criar uma segunda
instância. O `bunzina-infra` provisiona previamente a rede e o cluster.

## Acesso e migrations

- A API usa o endereço do Service Kubernetes para acessar o PostgreSQL.
- A Lambda delega a autenticação à API; não possui acesso direto ao banco.
- As migrations SQL continuam em `bunzina/migrations/`, executadas pelo pipeline da aplicação.
- O workflow pode alcançar o banco pelo port-forward do Service `postgres` ou por um `DB_HOST` acessível ao runner.
- `DB_HOST` configura o endereço usado para acessar o PostgreSQL.

## Referência vigente

Sizing, recursos, credenciais, limitações e critérios de validação estão na
[ADR-001](../../adrs/adr-001-postgresql-terraform.md). A existência de suporte a
host externo no deploy não muda a decisão de usar PostgreSQL no EKS.
