# ADR 0007 — Engine próprio de migrations

- Status: Aceita
- Data: Fase 1

## Contexto

Precisávamos versionar o schema sem ORM. As migrations têm de rodar local, no CI e em produção, com histórico do que já foi aplicado.

## Decisão

Engine em `migrations/engine/`: lê `migrations/*.sql` em ordem, grava em `bunzina.migrations`, aplica só o pendente. Em `main`, só vale **adicionar** arquivo novo.

## Motivo

- Zero dependência extra
- SQL explícito, fácil de revisar no PR
- O mesmo comando (`bun run migration`) serve em todos os ambientes

## Consequências

- Proibido editar migration já mergeada — o job `validate-migrations` quebra o deploy
- Correção = nova migration
- Na Fase 3 o engine **permanece no repo da aplicação**; o repo de infra de banco provisiona a instância, não o schema

## Alternativas

- Prisma Migrate / Flyway / Liquibase — mais ferramenta para o mesmo volume de SQL
