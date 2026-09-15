# ADR 0001 — PostgreSQL como banco de dados

- Status: Aceita
- Data: Fase 1

## Contexto

O domínio tem cliente, veículo, OS, itens, estoque e usuários, com FKs e ciclo de vida longo. Precisávamos de um banco relacional aceito pelo PDF (PostgreSQL, MySQL, SQL Server ou equivalente).

## Decisão

Usar **PostgreSQL**, schema `bunzina`, acesso via `bun:sql`.

## Motivo

- Relacionamentos e transações ACID batem com o agregado de OS e a baixa de estoque
- `UUID`, `ENUM`, `NUMERIC` e `TIMESTAMPTZ` mapeiam os value objects
- Schema isolado funciona em instância compartilhada (local, in-cluster ou gerenciado)
- Ecossistema maduro e suporte direto no Bun

## Consequências

- Migrations SQL versionadas; sem Prisma/TypeORM
- Mesmo dialeto SQL no desenvolvimento local e no EKS
- Time precisa conhecer SQL e o engine próprio

## Alternativas

- MySQL — pior suporte a ENUM nativo e timestamptz
- SQL Server — licença e atrito no Academy
- Document store — enfraquece FKs e consistência de estoque
