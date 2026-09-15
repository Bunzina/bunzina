# Banco de dados

Diagrama ER: [diagrams/er.md](./diagrams/er.md). Decisão de produto: [ADR 0001](./adrs/0001-postgresql.md). Provisionamento no EKS: [ADR-001](../adrs/adr-001-postgresql-terraform.md).

O modelo abaixo representa o schema atual, conforme as migrations `001` a `012`.
O relacionamento entre `users` e `customers` ainda não existe no banco atual e,
por isso, não aparece como FK no diagrama.

---

## Por que PostgreSQL

O domínio é relacional: cliente → veículo → OS → itens. Isso pede FK, transação e consistência, não um documento solto.

| Motivo | Como aparece no projeto |
| --- | --- |
| Relacionamentos explícitos | `vehicles.customer_id`, `service_orders.customer_id/vehicle_id`, itens e `stock_movements` |
| ACID | Criação da OS grava cabeçalho + itens; aprovação baixa estoque com histórico |
| Tipos nativos | `UUID`, `ENUM`, `NUMERIC(10,2)`, `TIMESTAMPTZ` mapeiam os VOs |
| Schema próprio | Tudo vive em `bunzina`, isolado do `public` |
| Driver no runtime | `bun:sql`, sem ORM |
| Evolução | Índices, checks e migrations incrementais já usados |

Alternativas descartadas: MySQL (ENUMs e `TIMESTAMPTZ` piores), SQL Server (custo/licença no Academy), MongoDB (agregado de OS até funciona, estoque e FKs não).

---

## Como o schema evolui

Migrations SQL em `migrations/`, ordem numérica. Engine próprio em `migrations/engine/` registra o que já rodou na tabela `bunzina.migrations`.

Regras:

- Arquivo aplicado **não se edita**. O CI em `main` bloqueia modify/delete de `migrations/*.sql`
- Ajuste = nova migration
- `bun run migration` aplica só o pendente
- Em produção o job `migrate-prod` roda antes do deploy quando há arquivo novo

---

## Tabelas

### `customers`

Pessoa física ou jurídica que leva o veículo. Documento (CPF/CNPJ) é identidade de negócio e chave de busca.

| Coluna | Papel |
| --- | --- |
| `id` | Identidade interna (UUID) |
| `document` + `document_kind` | CPF ou CNPJ, único, validado no domínio |
| `email` | Único; destino do orçamento |
| `address_*` | Endereço desnormalizado (VO `Address`, sem tabela extra) |

### `vehicles`

Aggregate Root separado de Cliente de propósito: CRUD e REST mais simples. `customer_id` é validado na application.

- `ON DELETE CASCADE` no cliente: apagar cliente remove os veículos
- Placa única (`license_plate`)

### `users`

Conta de acesso (`ADMIN`, `MECHANIC`, `CUSTOMER`). **Não** tem documento hoje. `is_active` impede login sem apagar histórico.

### `services` e `auto_parts`

Catálogo. Soft-delete via `is_active`: item inativo não entra em OS nova, mas permanece nas históricas.

Ajustes posteriores:

- `010` — `auto_parts.is_active`
- `012` — `services.completed_count` e `total_execution_time_ms` para tempo médio de execução

`auto_parts.stock` é valor **desnormalizado**. A fonte auditável é `stock_movements`.

### `service_orders`

Coração do domínio. Orçamento persistido em três totais (`quote_services_total`, `quote_auto_parts_total`, `quote_total`) para não recalcular histórico.

Timestamps de ciclo: `approved_at`, `started_at`, `completed_at`, `delivered_at`.

FKs para cliente e veículo **sem** cascade: apagar cliente com OS exige regra de aplicação.

### Itens da OS

`service_order_service_items` e `service_order_auto_part_items` são entidades filhas. `ON DELETE CASCADE` a partir da OS.

Ajuste `011` nos itens de serviço:

| Coluna | Uso |
| --- | --- |
| `is_completed` | Item concluído; todos precisam estar true para fechar a OS |
| `finished_at` | Quando o item foi concluído |
| `execution_time_ms` | Duração daquele item (métrica) |
| `created_at` / `updated_at` | Auditoria do item |

### `stock_movements`

Histórico `IN` / `OUT`. `service_order_id` é opcional (`ON DELETE SET NULL`) para não perder a movimentação se a OS for removida.

---

## Relacionamentos

```
customers 1 ──< vehicles
customers 1 ──< service_orders
vehicles  1 ──< service_orders
service_orders 1 ──< service_order_service_items >── 1 services
service_orders 1 ──< service_order_auto_part_items >── 1 auto_parts
service_orders 1 ──< stock_movements >── 1 auto_parts
users          (sem FK para customers no modelo atual)
```

| Relação | Cardinalidade | Integridade |
| --- | --- | --- |
| Cliente → Veículos | 1:N | Cascade no delete do cliente |
| Cliente → OS | 1:N | Restrict; regra “não excluir cliente com OS ativa” |
| Veículo → OS | 1:N | Restrict |
| OS → Itens de serviço / peça | 1:N | Cascade no delete da OS |
| Serviço / Peça → Itens | 1:N | Restrict (catálogo não some de OS antiga) |
| Peça → Movimentações | 1:N | Restrict |
| OS → Movimentações | 1:N opcional | Set null se a OS sumir |
| Usuário → Cliente | sem relação | Associação ainda não implementada |

---

## Ajustes já aplicados nas tabelas

| Migration | Ajuste | Motivo |
| --- | --- | --- |
| `001` | Schema + ENUMs | Isolar o domínio e tipar status/papel/documento |
| `010` | `auto_parts.is_active` | Soft-delete alinhado a `services` |
| `011` | timestamps + `is_completed` + `execution_time_ms` nos itens | Fechar OS só com itens prontos e medir tempo |
| `012` | acumuladores em `services` | Tempo médio de execução sem varrer todas as OS |

Índices relevantes: `vehicles.customer_id`, `service_orders(customer_id, vehicle_id, status)`, itens por OS e por catálogo, `stock_movements` por peça e OS, `auto_parts.is_active`, itens `(service_order_id, is_completed)`.

---

## Evolução de autenticação

`users` precisa carregar o CPF usado no login. Essa é uma evolução do modelo e
deve ser aplicada por uma nova migration, sem editar as migrations já executadas.

Proposta (ver RFC 0001):

```sql
ALTER TABLE bunzina.users
  ADD COLUMN document VARCHAR(14) UNIQUE,
  ADD COLUMN customer_id UUID REFERENCES bunzina.customers(id);

CREATE UNIQUE INDEX idx_users_document
  ON bunzina.users(document)
  WHERE document IS NOT NULL;
```

- `CUSTOMER`: `document` obrigatório e igual ao do cliente vinculado
- `ADMIN` / `MECHANIC`: documento opcional (identificação interna), sem obrigar `customer_id`

Até essa migration existir, a Lambda de auth não consegue associar CPF ao usuário
só com o schema atual.

## PostgreSQL no EKS e acesso

O banco da solução é PostgreSQL 15 dentro do EKS, conforme a
[ADR-001 de provisionamento](../adrs/adr-001-postgresql-terraform.md).

O repositório `bunzina-db` é responsável pelos recursos do banco via Terraform:
Deployment de uma réplica, Service `postgres:5432`, PVC `gp3` e credenciais no
namespace `bunzina`. O chart da API deve consumir esse Service sem criar outro
PostgreSQL.

A API usa `PROD_DB_HOST=postgres`, `PROD_DB_PORT=5432` e `PROD_DB_NAME=bunzina`.
A Lambda acessa a API por HTTP e não se conecta diretamente ao banco.
As migrations deste repositório criam e evoluem o schema; não são executadas
pelo Terraform do banco.

O workflow usa `postgres` como host padrão e permite sobrescrevê-lo com
`DB_HOST`. Essa variável pode apontar para o Service Kubernetes.
Para migrations no CI, o workflow
usa port-forward quando `DB_HOST` não está definido.

O `values.yaml` ainda contém um host Supabase estático e `database.enabled=true`,
mas o workflow sobrescreve o host e a decisão aceita atribui o banco ao
`bunzina-db`. Esses valores precisam ser distinguidos da arquitetura adotada:
o deploy deve evitar criar um segundo PostgreSQL pelo chart da API.

Para desenvolvimento local, o PostgreSQL do Docker Compose continua disponível.
