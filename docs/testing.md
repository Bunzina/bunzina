# Testes

Este documento explica **quais tipos de teste existem no projeto**, **o objetivo de cada um**, **como executá-los** e **como interpretar o resultado**. O README traz um resumo rápido dos comandos na seção "Testes"; aqui vai o detalhamento completo.

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

---

## Como executar os testes

Os comandos abaixo estão definidos em [package.json](../package.json):

```bash
# Testes unitários (todo o projeto, com relatório de cobertura)
bun test

# Um arquivo específico
bun test src/adapters/input/customer/create.test.ts

# Um diretório específico
bun test src/adapters/input/customer

# Modo watch, útil durante o desenvolvimento
bun test --watch
```

```bash
# Testes de integração
bun run test:integration
```

`bun run test:integration` encadeia três passos automaticamente (via `pre`/`post` scripts do `package.json`):

1. `test:database` — sobe o container `db_test` (PostgreSQL) via `docker compose up db_test -d` e aguarda alguns segundos.
2. Roda `bun test --config=./bunfig.integration.toml ./src/test/integration/`, que aplica as migrations reais no banco de teste (via `setupIntegration()`, chamado no `beforeAll` de cada arquivo) e então executa os testes.
3. `posttest:integration` — para o container `db_test` (`docker compose stop db_test`) ao final, com sucesso ou falha.

Não é necessário subir o `db_test` manualmente nem derrubá-lo depois: o próprio comando cuida do ciclo de vida do container.

---

## Pré-requisitos

**Testes unitários:**

- Apenas `bun install`. Não dependem de banco de dados, Docker ou variáveis de ambiente específicas — o preload [src/test/setup.ts](../src/test/setup.ts) já define `JWT_SECRET` e `API_KEY` com valores fixos de teste.

**Testes de integração:**

- Docker e Docker Compose disponíveis e o daemon rodando, para subir o container `db_test` (definido em [docker-compose.yml](../docker-compose.yml), porta `5433`).
- Nenhuma variável de ambiente precisa ser configurada manualmente: `DATABASE_URL` e `APP_ENV` são definidas pelo próprio `setupIntegration()` em [helpers.ts](../src/test/integration/helpers.ts), apontando por padrão para `postgres://bun:bun@localhost:5433/bunzina_test`.
- Caso o banco de teste rode em outro host/porta, é possível sobrescrever com a variável `DATABASE_URL_TEST` antes de rodar o comando, por exemplo: `DATABASE_URL_TEST=postgres://bun:bun@localhost:5433/bunzina_test bun run test:integration`.
- As migrations são aplicadas automaticamente no início da suíte — não é preciso rodá-las manualmente antes.

---

## Exemplo de execução dos testes de integração

```bash
$ bun run test:integration
$ docker compose up db_test -d
 Container bunzina-db_test-1  Started
$ bun test --config=./bunfig.integration.toml ./src/test/integration/
bun test v1.4.0

Integration - Health endpoints
✓ GET /health returns ok [12.34ms]

Integration - Customers endpoints
✓ POST/GET/PUT/DELETE /customers [284.10ms]

 18 pass
 0 fail
 42 expect() calls
Ran 18 tests across 8 files. [3.21s]
$ docker compose stop db_test
 Container bunzina-db_test-1  Stopped
```

Quando um teste falha, o Bun imprime o arquivo e a linha do `expect` que não bateu, junto com o valor esperado e o recebido, por exemplo:

```text
src/test/integration/auth.test.ts:
27 |     expect(response.status).toBe(422);
                                 ^
error: expect(received).toBe(expected)

Expected: 422
Received: 400

(fail) Integration - Auth endpoints > POST /auth/login returns 422 for invalid payload [47.47ms]
```

---

## Interpretando o resultado

Ao final de qualquer execução (`bun test` ou `bun run test:integration`), o Bun imprime um resumo:

```text
 X pass
 Y fail
 N expect() calls
Ran T tests across F files. [tempo]
```

- **`X pass` / `Y fail`**: quantidade de testes que passaram e falharam. Qualquer `Y fail > 0` faz o processo terminar com código de saída diferente de zero — é esse código que o CI usa para marcar o workflow como falho.
- Cada teste que falha aparece **antes** do resumo, marcado com `(fail)`, mostrando o `describe`/`test` correspondente, a asserção que falhou (valor esperado vs. recebido) e o arquivo:linha exato — é aí que se deve olhar primeiro.
- **Cobertura** (`bun test`, via [bunfig.toml](../bunfig.toml)): uma tabela por arquivo com `% Funcs`, `% Lines` e as linhas não cobertas (`Uncovered Line #s`). O projeto exige um mínimo de 80% em linhas, funções, statements e branches (`coverageThreshold`); se algum arquivo ficar abaixo disso, o comando também termina com falha, mesmo que todos os testes tenham passado. Os testes de integração e o pipeline de CI (`bunfig.integration.toml` e `bunfig.ci.toml`) rodam com `coverage = false`, então essa tabela não aparece neles.
