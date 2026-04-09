# Bunzina

API REST para gerenciamento de uma oficina mecânica, desenvolvida com **Bun**, **Elysia** e **PostgreSQL**, seguindo os princípios de **Clean Architecture**.

---

## Objetivo do sistema

O Bunzina tem como objetivo digitalizar e centralizar os processos operacionais de uma oficina mecânica, permitindo:

- Cadastro e gerenciamento de **clientes** e seus **veículos**
- Criação e acompanhamento de **ordens de serviço**, do diagnóstico à entrega
- Controle de **serviços** prestados e **peças** utilizadas
- Gestão de **estoque de autopeças** com rastreamento de movimentações
- Geração de **orçamentos** automatizados a partir dos serviços e peças da OS
- Gerenciamento de **usuários** internos com controle de acesso por papel (admin, mecânico)

---

## Tecnologias

- [Bun](https://bun.sh) — runtime, test runner e gerenciador de pacotes
- [Elysia](https://elysiajs.com) — framework HTTP
- [PostgreSQL](https://www.postgresql.org) — banco de dados
- [Zod](https://zod.dev) — validação de dados
- [Day.js](https://day.js.org) — formatação de datas
- [oxlint](https://oxc.rs/docs/guide/usage/linter) + [oxfmt](https://github.com/nicolo-ribaudo/oxfmt) — lint e formatação

---

## Justificativa do banco de dados

O **PostgreSQL** foi escolhido pelos seguintes motivos:

- **Relacional e consistente** — o domínio da oficina possui relacionamentos bem definidos (cliente → veículo → ordem de serviço → itens), que se beneficiam de chaves estrangeiras e transações ACID
- **Tipos nativos** — suporte a `UUID`, `ENUM`, `NUMERIC` e `TIMESTAMPTZ`, que mapeiam diretamente para os value objects do domínio
- **Schemas** — permite isolar as tabelas do projeto no schema `bunzina`, facilitando a organização em ambiente compartilhado
- **Maturidade e ecossistema** — solução amplamente adotada, com excelente suporte no Bun via `bun:sql`
- **Escalabilidade** — suporta índices avançados, particionamento e extensões (como `uuid-ossp`) para crescimento futuro do sistema

---

## Estrutura de pastas

```
src/
  adapters/         # Entrada (input) e saída (output) — camada de apresentação
  api/              # Servidor Elysia, handlers e schemas de documentação
  application/      # Casos de uso
  domain/           # Entidades, value objects, tipos e repositórios (interfaces)
  infrastructure/   # Implementações concretas (banco de dados, repositórios)
  test/             # Factories para testes
  utils/            # Helpers de validação
migrations/         # Migrations SQL em ordem de execução
```

---

## Pré-requisitos

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://www.docker.com) e Docker Compose

---

## Instalação

```bash
bun install
```

---

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp .env.prod.example .env
```

Para desenvolvimento local o valor padrão já funciona com o Docker Compose:

```
DATABASE_URL=postgres://bun:bun@localhost:5432/bunzina
APP_ENV=dev
```

---

## Rodando o projeto

### Com Docker (recomendado)

Sobe a aplicação e o banco juntos, com hot reload:

```bash
bun dev
```

### Localmente (sem Docker)

Sobe apenas o banco via Docker e roda a API com hot reload:

```bash
docker compose up db -d
bun --hot run src/api/server.ts
```

A API estará disponível em `http://localhost:3000`.  
Documentação Swagger em `http://localhost:3000/swagger`.

---

## Migrations

As migrations ficam em `migrations/` e devem ser executadas em ordem numérica.

### Rodando via Docker (sem cliente PostgreSQL instalado localmente)

```bash
# Sobe apenas o banco
docker compose up db -d

# Executa todas as migrations
for f in migrations/*.sql; do
  docker compose exec -T db psql -U bun -d bunzina -f - < "$f"
done
```

### Rodando com cliente PostgreSQL instalado localmente

```bash
for f in migrations/*.sql; do
  psql "postgres://bun:bun@localhost:5432/bunzina" -f "$f"
done
```

---

## Testes

```bash
# Roda todos os testes
bun test

# Roda com cobertura
bun test --coverage

# Roda um arquivo específico
bun test src/adapters/input/customer/create.test.ts
```

---

## Lint e formatação

```bash
# Verifica lint
bun lint

# Corrige lint automaticamente
bun lint:fix

# Formata o código
bun fmt

# Verifica formatação sem alterar
bun fmt:check
```

---

## Qualidade e segurança de codigo (Semgrep OSS)

O projeto usa **Semgrep OSS** no CI para analise estatica de seguranca e qualidade em codigo TypeScript e migrations SQL.

- Objetivo: identificar riscos cedo em PRs com feedback acionavel
- Escopo atual: apenas Semgrep OSS (sem Trivy nesta fase)
- Politica atual: **advisory** (alerta, sem bloquear merge)
- Execucao no CI: workflow dedicado de PR em `.github/workflows/security-pr-scan.yml`
- Implementacao no CI: padrao oficial Semgrep com container no nivel do job (`container.image: semgrep/semgrep`)
- Qualidade basica em PR: workflow dedicado em `.github/workflows/lint-format-pr.yml`

### Como interpretar os alertas

Cada achado do Semgrep deve ser lido pelos campos principais:

- Severidade: impacto potencial (foco inicial em HIGH/CRITICAL)
- Regra: qual padrao inseguro/ruim foi detectado
- Arquivo e linha: local exato para correcao
- Mensagem de remediacao: sugestao inicial de ajuste

### Fluxo de triagem

1. Verifique os achados no resultado do workflow e na aba Security do GitHub (quando SARIF for publicado).
2. Classifique cada achado em: corrigir agora, falso-positivo, ou risco aceito temporariamente.
3. Para falso-positivo, registre justificativa tecnica no PR e ajuste de regra quando necessario.
4. Para risco real, priorize correcoes de alta/critica e abra tarefa para os demais.

### Execucao local (opcional)

Se o Semgrep estiver instalado localmente:

```bash
# install through pip
python3 -m pip install semgrep

# if you get the following error "error: externally-managed-environment",
# see semgrep.dev/docs/kb/semgrep-appsec-platform/error-externally-managed-environment

# confirm installation succeeded by printing the currently installed version
semgrep --version

semgrep scan \
  --config auto \
  src migrations
```

Para o planejamento e as decisoes adotadas, consulte o documento [docs/code-quality-and-security-plan.md](docs/code-quality-and-security-plan.md).

---

## Endpoints

| Método | Rota         | Descrição          |
| ------ | ------------ | ------------------ |
| GET    | `/health`    | Healthcheck da API |
| POST   | `/customers` | Criar novo cliente |
