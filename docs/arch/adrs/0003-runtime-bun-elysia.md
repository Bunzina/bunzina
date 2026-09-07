# ADR 0003 — Runtime Bun e framework Elysia

- Status: Aceita
- Data: Fase 1

## Contexto

Precisávamos de runtime TypeScript, test runner, HTTP e OpenAPI sem montar um monólito Nest.

## Decisão

**Bun** como runtime, gerenciador de pacotes e test runner. **Elysia** como framework HTTP, com `@elysiajs/openapi` no `/swagger`.

## Motivo

- Um toolchain só (`bun test`, `bun install`, `bun --hot`)
- Elysia é nativo no Bun e gera Swagger com Zod
- Imagem Docker menor que Node + dist

## Consequências

- CI usa `oven-sh/setup-bun`
- Algumas libs Node precisam de atenção de compatibilidade
- Hash de senha via `Bun.password`, JWT via Web Crypto

## Alternativas

- Node + Fastify/Express — mais comum, mais peças
- NestJS — pesado demais para o tamanho do time e do prazo
