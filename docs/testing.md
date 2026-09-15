# Testes

Este documento explica **quais tipos de teste existem no projeto** e **o objetivo de cada um**. Os comandos de execução (`bun test`, `bun run test:integration`) e seus pré-requisitos ainda serão detalhados na seção de testes do [README](../README.md) — ver item pendente em [tasks-phase-3.md](tasks-phase-3.md).

---

## Tipos de teste

O projeto possui dois tipos de teste, com objetivos e infraestrutura diferentes: **testes unitários** e **testes de integração**. Ambos usam o test runner nativo do Bun (`bun:test`), mas rodam com configurações e finalidades distintas.

| Tipo | Objetivo | Dependências externas | Roda no CI |
| --- | --- | --- | --- |
| Unitário | Validar uma unidade isolada (input, use case, presenter, value object, etc.) | Nenhuma — dependências são mockadas | Sim |
| Integração | Validar o fluxo HTTP completo, de ponta a ponta, contra um banco real | PostgreSQL (`db_test`) | Não (rodam apenas localmente) |

---

## Testes unitários

**Objetivo:** garantir que cada peça da aplicação (adapters de entrada/saída, use cases, presenters, value objects, engine de migrations) se comporta corretamente de forma isolada, sem depender de banco de dados, rede ou outros serviços.

**Onde ficam:** ao lado do arquivo que testam, com o sufixo `.test.ts` (ex.: [src/adapters/input/customer/create.ts](../src/adapters/input/customer/create.ts) e [src/adapters/input/customer/create.test.ts](../src/adapters/input/customer/create.test.ts)). Essa convenção vale para toda a árvore de `src/` e também para o engine de migrations em `migrations/engine/`.

**Características:**

- Dependências (repositórios, use cases, gateways) são substituídas por mocks usando [bun-mock-extended](https://github.com/marchaos/jest-mock-extended) — não há chamada real a banco, e-mail ou HTTP externo.
- Dados de teste são montados com as **factories** de `src/test/factories/` (ver seção abaixo), evitando duplicar payloads de exemplo em cada teste.
- São rápidos e determinísticos, por isso são o tipo de teste executado no pipeline de CI.

**Padrão típico** (adapters de entrada):

1. Arrange: criar mocks do use case e montar o `Context` da requisição.
2. Act: executar o método do adapter.
3. Assert: verificar status HTTP, corpo da resposta e os argumentos com que o use case foi chamado.

Esse padrão cobre tanto o caminho feliz quanto os de erro (payload inválido, falha no use case), como em [src/adapters/input/customer/create.test.ts](../src/adapters/input/customer/create.test.ts).

### Teste de cobertura de importação

O arquivo [src/test/coverage.collector.test.ts](../src/test/coverage.collector.test.ts) não é um teste de comportamento: ele varre `src/` e importa todos os arquivos `.ts`/`.tsx` que não sejam de teste. O objetivo é garantir que módulos sem teste próprio (ex.: tipos, configs simples) ainda sejam carregados pelo runtime de cobertura, evitando que fiquem marcados como "0% coberto" apenas por nunca terem sido importados. Ele não substitui um teste unitário dedicado ao módulo.

---

## Testes de integração

**Objetivo:** validar o comportamento real da API — roteamento, autenticação, regras de negócio e persistência — fazendo requisições HTTP contra a aplicação Elysia (via `app.handle`) e um PostgreSQL real, do jeito mais próximo possível do que acontece em produção.

**Onde ficam:** em `src/test/integration/`, um arquivo por área (ex.: [auth.test.ts](../src/test/integration/auth.test.ts), [customers.test.ts](../src/test/integration/customers.test.ts), [service-orders.test.ts](../src/test/integration/service-orders.test.ts)). O arquivo [helpers.ts](../src/test/integration/helpers.ts) concentra a infraestrutura comum: subir a aplicação e o banco, autenticar um usuário de teste, truncar as tabelas entre os testes e helpers para criar cliente/veículo/serviço/peça de apoio.

**Características:**

- Usam um banco PostgreSQL isolado (`db_test`, subido via Docker Compose) e rodam as migrations reais antes dos testes (`setupIntegration`).
- Cada teste limpa as tabelas ao final (`afterEach` → `truncateDatabase`) para não vazar estado entre os casos.
- Não usam mocks: exercitam o fluxo completo — validação de entrada, use case, repositório e banco.
- Não rodam automaticamente no CI hoje (o job de testes do workflow de deploy usa `bunfig.ci.toml`, que ignora `src/test/`); são pensados para execução local antes de abrir um PR que altera fluxos de ponta a ponta.

---

## Factories de teste

Ficam em `src/test/factories/` (ex.: [make-customer.ts](../src/test/factories/make-customer.ts), [make-service-order.ts](../src/test/factories/make-service-order.ts)). Cada `make-*` monta uma entidade ou value object de domínio válido, com valores padrão sobrescrevíveis. São usadas tanto pelos testes unitários (para criar o retorno esperado de um mock) quanto, indiretamente, para manter os payloads de teste alinhados ao formato real do domínio.

---

## Configurações de teste (`bunfig`)

O projeto tem três arquivos de configuração do test runner, um para cada cenário de execução:

| Arquivo | Uso | Cobertura | Observações |
| --- | --- | --- | --- |
| [bunfig.toml](../bunfig.toml) | Padrão (`bun test`) | Habilitada, mínimo 80% (linhas/funções/statements/branches) | Ignora `src/test/**` na varredura e na cobertura |
| [bunfig.ci.toml](../bunfig.ci.toml) | Pipeline de CI | Desabilitada | Mesmos `pathIgnorePatterns` do padrão; timeout de 60s para acomodar a máquina do runner |
| [bunfig.integration.toml](../bunfig.integration.toml) | `bun run test:integration` | Desabilitada | Sem `pathIgnorePatterns` — precisa alcançar `src/test/integration/`; timeout de 60s |

Todos carregam [src/test/setup.ts](../src/test/setup.ts) como preload, que define variáveis de ambiente padrão (`JWT_SECRET`, `API_KEY`) e mocka o logger para não poluir a saída dos testes — exceto o `bunfig.integration.toml`, que não faz preload porque os testes de integração inicializam seu próprio ambiente via `setupIntegration()`.

---

## Testes do engine de migrations

O engine de migrations (`migrations/engine/`) tem seus próprios testes unitários, seguindo a mesma convenção de arquivo ao lado (`index.test.ts`, `read-migrations.test.ts`, `run-pending.test.ts`, etc.). Eles mockam os módulos internos (leitura de arquivos, conexão com banco) para validar a lógica de decidir e aplicar migrations pendentes sem depender de um banco real.
