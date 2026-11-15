# Diagrama ER do `bunzina-os`

PostgreSQL próprio do orquestrador, schema `bunzina`, migrations `001` a `007`.
Não há FK para os bancos de cadastro ou billing: cliente e veículo entram como
snapshot na criação da OS ([ADR 0012](../adrs/0012-microservices-split.md)).

```mermaid
erDiagram
    SERVICE_ORDERS ||--o{ SERVICE_ORDER_SERVICE_ITEMS : contains
    SERVICE_ORDERS ||--o{ SERVICE_ORDER_AUTO_PART_ITEMS : contains
    SERVICE_ORDERS ||--|| SAGA_INSTANCES : orchestrates

    SERVICE_ORDERS {
        uuid id PK
        uuid customer_id "snapshot, sem FK"
        text customer_name
        text customer_document
        text customer_email "nulo"
        uuid vehicle_id "snapshot, sem FK"
        text vehicle_plate
        text vehicle_model "nulo"
        service_order_status status
        numeric quote_services_total
        numeric quote_auto_parts_total
        numeric quote_total
        timestamptz approved_at "nulo"
        timestamptz paid_at "nulo"
        timestamptz started_at "nulo"
        timestamptz completed_at "nulo"
        timestamptz delivered_at "nulo"
        timestamptz created_at
        timestamptz updated_at
    }
    SERVICE_ORDER_SERVICE_ITEMS {
        uuid id PK
        uuid service_order_id FK
        uuid service_id "sem FK: vive no bunzina"
        numeric price
        text description "nulo"
        boolean is_completed
        timestamptz finished_at "nulo"
        bigint execution_time_ms "nulo"
    }
    SERVICE_ORDER_AUTO_PART_ITEMS {
        uuid id PK
        uuid service_order_id FK
        uuid auto_part_id "sem FK"
        integer quantity
        numeric unit_price
        numeric total_price
        text description "nulo"
    }
    SAGA_INSTANCES {
        uuid service_order_id PK_FK
        saga_status status
        text current_step
        jsonb completed_steps
        timestamptz step_deadline_at "nulo"
        text last_error "nulo"
        uuid quote_id "nulo, sem FK"
        uuid payment_id "nulo, sem FK"
        integer payment_amount_cents "nulo"
        timestamptz created_at
        timestamptz updated_at
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

`PROCESSED_EVENTS` e `OUTBOX_MESSAGES` não têm FK de domínio: são a mensageria
transacional (inbox/outbox). `completed_steps` em `saga_instances` é a lista dos
passos já feitos — a compensação depende de até onde a saga chegou, não só do passo
atual.

Status da OS: `RECEIVED`, `IN_DIAGNOSTIC`, `AWAITING_APPROVAL`, `AWAITING_PAYMENT`,
`IN_EXECUTION`, `COMPLETED`, `DELIVERED`, `CANCELED`.

Status da saga: `RUNNING`, `COMPENSATING`, `COMPLETED`, `FAILED`.
