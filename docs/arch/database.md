# Banco de dados

Diagrama ER: [diagrams/er.md](./diagrams/er.md). Decisão de produto: [ADR 0001](./adrs/0001-postgresql.md). Provisionamento no EKS: [ADR-001](../adrs/adr-001-postgresql-terraform.md).

O modelo abaixo representa o schema atual, conforme as migrations `001` a `013`.
As tabelas `users` e `customers` não possuem FK entre si.

---

## Por que PostgreSQL

O domínio é relacional: cliente → veículo → OS → itens. Isso pede FK, transação e consistência, não um documento solto.

| Motivo | Como aparece no projeto |
| --- | --- |
| Relacionamentos explícitos | `vehicles.customer_id`, `service_orders.customer_id/vehicle_id`, itens e `stock_movements` |
| ACID | Criação da OS grava cabeçalho e itens em uma transação |
| Tipos nativos | `UUID`, `ENUM`, `NUMERIC(10,2)`, `TIMESTAMPTZ` mapeiam os VOs |
| Schema próprio | Tabelas de domínio em `bunzina`; controle de migrations em `public.migrations` |
| Driver no runtime | `bun:sql`, sem ORM |
| Evolução | Índices, checks e migrations incrementais já usados |

Alternativas descartadas: MySQL (ENUMs e `TIMESTAMPTZ` piores), SQL Server (custo/licença no Academy), MongoDB (agregado de OS até funciona, estoque e FKs não).

---

## Como o schema evolui

Migrations SQL em `migrations/`, ordem numérica. Engine próprio em `migrations/engine/` registra o que já rodou na tabela `public.migrations`.

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

Conta de acesso (`ADMIN`, `MECHANIC`, `CUSTOMER`). O campo `document` é `VARCHAR(11)`, obrigatório e único, usado no login por CPF. `is_active` impede o login quando a conta está desativada.

### `services` e `auto_parts`

Catálogo com soft-delete por `is_active`. Os repositórios de serviços e peças filtram itens ativos nas consultas por ID usadas na criação de OS.

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
service_orders 0..1 ──< stock_movements >── 1 auto_parts
users          (sem FK para customers no modelo atual)
```

| Relação | Cardinalidade | Integridade |
| --- | --- | --- |
| Cliente → Veículos | 1:N | Cascade no delete do cliente |
| Cliente → OS | 1:N | NO ACTION; FK impede excluir cliente referenciado por OS |
| Veículo → OS | 1:N | NO ACTION |
| OS → Itens de serviço / peça | 1:N | Cascade no delete da OS |
| Serviço / Peça → Itens | 1:N | NO ACTION |
| Peça → Movimentações | 1:N | NO ACTION |
| OS → Movimentações | 1:N opcional | Set null se a OS sumir |
| Usuário → Cliente | sem relação | Sem FK; login busca users.document |

---

## Ajustes já aplicados nas tabelas

| Migration | Ajuste | Motivo |
| --- | --- | --- |
| `001` | Schema + ENUMs | Isolar o domínio e tipar status/papel/documento |
| `010` | `auto_parts.is_active` | Soft-delete alinhado a `services` |
| `011` | timestamps + `is_completed` + `execution_time_ms` nos itens | Fechar OS só com itens prontos e medir tempo |
| `012` | acumuladores em `services` | Tempo médio de execução sem varrer todas as OS |
| `013` | documento obrigatório e único em `users` | Compatibilidade das bases existentes com login por CPF |

Índices relevantes: `vehicles.customer_id`, `service_orders(customer_id, vehicle_id, status)`, itens por OS e por catálogo, `stock_movements` por peça e OS, `auto_parts.is_active`, itens `(service_order_id, is_completed)`.

---

## Autenticação por documento

O login recebe `document` e `password`. A API consulta `users.document`, verifica
senha e status e gera o JWT. Não há coluna `users.customer_id` nem FK para
`customers`; o documento permite identificar o usuário sem essa associação.

A migration `013` adiciona `document VARCHAR(11)` às bases existentes, preenche
valores ausentes e aplica NOT NULL e unicidade. Os documentos gerados para
registros antigos são placeholders; precisam ser substituídos pelos CPFs reais
para representar corretamente as contas.

## PostgreSQL no EKS e acesso

O banco da solução é PostgreSQL 15 dentro do EKS, conforme a
[ADR-001 de provisionamento](../adrs/adr-001-postgresql-terraform.md).

O repositório `bunzina-db` é responsável pelos recursos do banco via Terraform:
Deployment de uma réplica, Service ClusterIP `postgres:5432`, StorageClass `gp3`, PVC de 10 GiB e Secret `postgres` no
namespace `bunzina`. O chart da API deve consumir esse Service sem criar outro
PostgreSQL.

A API usa `PROD_DB_HOST=postgres`, `PROD_DB_PORT=5432` e `PROD_DB_NAME=bunzina`.
A Lambda acessa a API por HTTP e não se conecta diretamente ao banco.
As migrations deste repositório criam e evoluem o schema; não são executadas
pelo Terraform do banco.

O workflow usa `postgres` como host padrão e permite sobrescrevê-lo com
`DB_HOST`. Quando preenchida, essa variável também é usada pelo runner nas migrations e precisa ser acessível a ele; um DNS interno do cluster, por si só, não atende a esse requisito.
Para migrations no CI, o workflow usa port-forward quando `DB_HOST` não está definido.

### Integração com o chart da aplicação

A configuração atual ainda mantém `app-chart.database.enabled=true`.
O workflow só desativa esse recurso quando `DB_HOST` está preenchido.
Para cumprir a decisão de provisionamento separado, o release da API precisa
desativar o banco do chart e manter o acesso das migrations por port-forward
ou por um endereço alcançável pelo runner.

Fontes: `bunzina-db/infra/postgres.tf`, `storage-class.tf` e `variables.tf`;
[workflow da API](../../.github/workflows/deploy-k8s.yml) e
[valores do chart](../../charts/bunzina-chart/values.yaml).

Para desenvolvimento local, o PostgreSQL do Docker Compose continua disponível.
