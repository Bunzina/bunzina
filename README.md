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
- [Nodemailer](https://nodemailer.com) — envio de notificações por e-mail via SMTP
- [MailCatcher](https://mailcatcher.me) — captura de e-mails em ambiente local para testes
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
JWT_SECRET=bunzina-jwt-secret
JWT_EXPIRES_IN=3600
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=1025
EMAIL_SMTP_USER=
EMAIL_SMTP_PASSWORD=
EMAIL=bunzina@local.com
```

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `JWT_SECRET` | Chave secreta para assinar/verificar tokens JWT | `bunzina-jwt-secret` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token em segundos | `3600` (1 hora) |
| `EMAIL_SMTP_HOST` | Host do servidor SMTP | `localhost` |
| `EMAIL_SMTP_PORT` | Porta do servidor SMTP local | `1025` |
| `EMAIL_SMTP_USER` | Usuário SMTP (quando necessário) | vazio |
| `EMAIL_SMTP_PASSWORD` | Senha SMTP (quando necessário) | vazio |
| `EMAIL` | Endereço remetente padrão das notificações | `bunzina@local.com` |

---

## Rodando o projeto

### Com Docker (recomendado)

Sobe a aplicação e o banco juntos, com hot reload:

```bash
bun dev
```

O Docker Compose também sobe o MailCatcher para testes locais de e-mail:

- SMTP local: `localhost:1025`
- UI web para visualizar e-mails enviados: `http://localhost:1080`

### Localmente (sem Docker)

Sobe apenas o banco via Docker e roda a API com hot reload:

```bash
docker compose up db mailcatcher -d
bun --hot run src/api/server.ts
```

A API estará disponível em `http://localhost:3000`.  
Documentação Swagger em `http://localhost:3000/swagger`.

Com o MailCatcher rodando, os e-mails disparados pelo serviço de notificação podem ser visualizados em `http://localhost:1080`.

---

## Serviço de notificação (Nodemailer + MailCatcher)

O envio de notificações por e-mail foi implementado com Nodemailer usando transporte SMTP configurável por variáveis de ambiente.

Em desenvolvimento local com Docker Compose:

1. A API usa SMTP local apontando para o serviço `mailcatcher` na porta `1025`.
2. Os e-mails não são enviados para provedores reais; ficam capturados localmente.
3. É possível inspecionar assunto, destinatário e conteúdo no painel web do MailCatcher em `http://localhost:1080`.

Isso permite validar rapidamente o fluxo de notificação sem depender de credenciais externas.

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

# Roda testes de integração
bun test src/api/server.test.ts
```

### Testes de integração

```bash
# Subir banco de testes
docker compose up db_test -d

# Executar testes de integração
bun run test:integration
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

## Segurança de código (CodeQL)

As análises de segurança são feitas com **GitHub CodeQL** (Code scanning), usando a integração nativa do GitHub para detectar vulnerabilidades e padrões inseguros no código.

- Objetivo: identificar riscos de segurança cedo no ciclo de desenvolvimento
- Escopo: análise estática de segurança no código versionado no repositório
- Fluxo de qualidade em PR: validações de lint e formatação no workflow [.github/workflows/lint-format-pr.yml](.github/workflows/lint-format-pr.yml)

### Onde consultar os alertas

1. Abra a aba Security do repositório no GitHub.
2. Entre em Code scanning alerts.
3. Filtre por severidade, branch e estado para priorizar correções.

### Como interpretar um alerta do CodeQL

- Regra: qual padrão inseguro foi detectado
- Severidade: impacto potencial do problema
- Localização: arquivo e linha afetados
- Data flow: caminho de origem até o ponto vulnerável (quando disponível)
- Recomendação: orientação sugerida para correção

### Fluxo de triagem recomendado

1. Validar se o alerta é vulnerabilidade real ou falso-positivo.
2. Corrigir imediatamente alertas de maior severidade.
3. Quando necessário, registrar justificativa técnica no PR para risco aceito temporariamente.
4. Reavaliar alertas abertos periodicamente para reduzir backlog de segurança.

---

## Endpoints

### Rotas públicas

| Método | Rota           | Descrição          |
| ------ | -------------- | ------------------ |
| GET    | `/health`      | Healthcheck da API |
| POST   | `/auth/login`  | Autenticação JWT   |

### Rotas protegidas (requerem JWT)

| Método | Rota                          | Descrição             |
| ------ | ----------------------------- | --------------------- |
| POST   | `/customers`                  | Criar novo cliente    |
| GET    | `/customers/:documentNumber`  | Buscar cliente        |
| PUT    | `/customers/:documentNumber`  | Atualizar cliente     |
| DELETE | `/customers/:documentNumber`  | Excluir cliente       |
| POST   | `/vehicles`                   | Criar novo veículo    |
| POST   | `/notifications`              | Enviar notificação    |

---

## Autenticação JWT

A API utiliza autenticação via **JSON Web Token (JWT)** com HMAC-SHA256 para proteger as rotas administrativas.

### Como funciona

1. O usuário faz login via `POST /auth/login` com email e senha
2. A API valida as credenciais e retorna um token JWT
3. O token deve ser enviado no header `Authorization` das requisições às rotas protegidas

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@bunzina.com", "password": "sua-senha"}'
```

Resposta:

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

### Acessando rotas protegidas

```bash
curl http://localhost:3000/customers/12345678909 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Payload do token

| Campo   | Descrição                          |
| ------- | ---------------------------------- |
| `sub`   | ID do usuário                      |
| `email` | Email do usuário                   |
| `role`  | Papel do usuário (ADMIN, MECHANIC) |
| `iat`   | Timestamp de emissão               |
| `exp`   | Timestamp de expiração             |

### Respostas de erro

| Status | Cenário                                      |
| ------ | -------------------------------------------- |
| 400    | Email ou senha com formato inválido          |
| 401    | Credenciais inválidas ou token ausente/expirado |
