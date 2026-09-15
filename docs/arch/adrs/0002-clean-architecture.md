# ADR 0002 — Clean Architecture sem ORM

- Status: Aceita
- Data: Fase 1

## Contexto

O Tech Challenge pede abordagem acadêmica de Clean/Hexagonal. O domínio não pode depender de framework HTTP nem de biblioteca de persistência.

## Decisão

As responsabilidades são organizadas em `domain`, `application`, `adapters`, `infrastructure` e `api`. Repositórios são interfaces no domínio; `bun:sql` só na infrastructure. Handlers Elysia não contêm regra de negócio.

## Motivo

- Testes de domínio e use case sem banco e sem HTTP
- Troca de driver/runtime sem reescrever entidades
- Avaliação consegue apontar onde está cada responsabilidade

## Consequências

- Mais arquivos e mapeamentos manuais (entity ↔ row)
- `docs/domain.md` descreve o alvo DDD; o código é a fonte da verdade quando diverge (ex.: não há EventEmitter/NestJS)

## Alternativas

- MVC + ORM — mais rápido, falha no critério acadêmico
- NestJS + Prisma — o `domain.md` chegou a citar isso; o time foi de Bun/Elysia de propósito
