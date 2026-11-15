# Diagrama ER do Billing

Modelo do banco do `bunzina-billing`, baseado nas migrations `001` a `008` do repositório
[bunzina-billing](https://github.com/Bunzina/bunzina-billing/tree/main/migrations). É um
PostgreSQL próprio do serviço, com o schema `bunzina`
([ADR 0012](../adrs/0012-microservices-split.md)), separado do banco do monólito descrito em
[er.md](./er.md).

```mermaid
erDiagram
    QUOTES ||--o| PAYMENTS : "é cobrado por"
    PAYMENTS ||--o{ PAYMENT_EVENTS : registra

    QUOTES {
        uuid id PK
        uuid service_order_id "sem FK: a OS vive no bunzina-os"
        uuid customer_id
        text customer_name
        text customer_document
        text customer_email "nulo"
        quote_status status
        bigint services_total_cents
        bigint auto_parts_total_cents
        bigint total_cents
        char3 currency
        jsonb items
        timestamptz expires_at
        timestamptz approved_at "nulo"
        text approved_by "nulo"
        timestamptz rejected_at "nulo"
        failure_reason rejection_reason "nulo"
        timestamptz canceled_at "nulo"
        timestamptz created_at
        timestamptz updated_at
    }
    PAYMENTS {
        uuid id PK
        uuid quote_id FK "único"
        uuid service_order_id "sem FK"
        payment_status status
        bigint amount_cents
        char3 currency
        text provider
        text provider_payment_id "nulo"
        text provider_refund_id "nulo"
        text method "nulo"
        text checkout_url "nulo"
        failure_reason failure_reason "nulo"
        text failure_detail "nulo"
        timestamptz expires_at "nulo, migration 008"
        timestamptz paid_at "nulo"
        timestamptz refunded_at "nulo"
        timestamptz created_at
        timestamptz updated_at
    }
    PAYMENT_EVENTS {
        uuid id PK
        uuid payment_id FK "nulo"
        text provider
        text event_type
        jsonb payload
        timestamptz received_at
    }
    PROCESSED_EVENTS {
        uuid event_id PK
        text consumer PK
        timestamptz handled_at
    }
    OUTBOX_MESSAGES {
        uuid event_id PK
        text event_type
        uuid correlation_id
        jsonb payload
        timestamptz created_at
        timestamptz published_at "nulo"
    }
```

`PROCESSED_EVENTS` e `OUTBOX_MESSAGES` não têm FK: são a infraestrutura da mensageria
transacional e não se ligam ao domínio por chave.

## Enums

| Tipo | Valores |
| --- | --- |
| `quote_status` | `ISSUED`, `APPROVED`, `REJECTED`, `EXPIRED`, `CANCELED` |
| `payment_status` | `PENDING`, `CONFIRMED`, `FAILED`, `REFUNDED` |
| `failure_reason` | `PART_UNAVAILABLE`, `EXPIRED`, `REJECTED`, `TIMEOUT`, `PROVIDER_ERROR`, `CUSTOMER_REQUEST`, `UNREPAIRABLE` |

## Cardinalidades e exclusão

| Pai | FK na tabela filha | Pais por filho | Filhos por pai | ON DELETE |
| --- | --- | --- | --- | --- |
| quotes | payments.quote_id | 1 | 0..1 | NO ACTION |
| payments | payment_events.payment_id | 0..1 | 0..* | CASCADE |

`payments.quote_id` tem índice único (`uq_payments_quote_id`), por isso um orçamento tem no
máximo um pagamento. `payment_events.payment_id` é opcional porque a notificação do
Mercado Pago é gravada antes de se saber a qual pagamento ela pertence; as que não
casam com nenhum ficam sem `payment_id`.

## Índices que carregam regra de negócio

| Índice | Garante |
| --- | --- |
| `uq_quotes_active_per_order` em `quotes(service_order_id)` onde `status` é `ISSUED` ou `APPROVED` | Um orçamento ativo por OS, mesmo com duas réplicas concorrentes |
| `uq_payments_quote_id` em `payments(quote_id)` | Um pagamento por orçamento |
| `uq_payments_provider_payment_id` em `payments(provider, provider_payment_id)` onde o id não é nulo | O pagamento do provedor liga a um único Pagamento do Billing |
| `idx_payments_pending_expires_at` em `payments(expires_at)` onde `status = 'PENDING'` | Varredura barata do job de expiração |
| `idx_outbox_messages_pending` em `outbox_messages(created_at, event_id)` onde `published_at` é nulo | Relay do outbox lê só o que falta publicar |
| chave primária `(event_id, consumer)` em `processed_events` | Idempotência do consumo: mensagem repetida é confirmada sem efeito |

## Dinheiro e itens

Valores são inteiros em **centavos** com a moeda ao lado (`BRL`); a conversão para o decimal
do Mercado Pago acontece só na borda do gateway. Os itens do orçamento (serviços e peças com
quantidade e preço unitário) ficam em `quotes.items` como JSONB, fixados na emissão, porque o
Billing não tem catálogo: ele recebe os itens no `cmd.billing.issue-quote`.
