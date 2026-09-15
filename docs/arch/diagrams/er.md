# Diagrama ER

Modelo atual do schema `bunzina`, baseado nas migrations `001` a `012`.
Fonte visual versionável: [er.svg](../er.svg). O PNG e o SVG mostram as 9 tabelas, 85 colunas e 9 FKs do domínio, incluindo as alterações das migrations 010–012.

![Modelo ER atual](../er.png)

```mermaid
erDiagram
    CUSTOMERS ||--o{ VEHICLES : owns
    CUSTOMERS ||--o{ SERVICE_ORDERS : requests
    VEHICLES ||--o{ SERVICE_ORDERS : receives
    SERVICE_ORDERS ||--o{ SERVICE_ORDER_SERVICE_ITEMS : contains
    SERVICES ||--o{ SERVICE_ORDER_SERVICE_ITEMS : cataloged_as
    SERVICE_ORDERS ||--o{ SERVICE_ORDER_AUTO_PART_ITEMS : contains
    AUTO_PARTS ||--o{ SERVICE_ORDER_AUTO_PART_ITEMS : used_as
    AUTO_PARTS ||--o{ STOCK_MOVEMENTS : records
    SERVICE_ORDERS o|--o{ STOCK_MOVEMENTS : related_to

    CUSTOMERS {
        uuid id PK
        varchar name
        varchar document UK
        document_kind document_kind
        varchar email UK
        varchar phone
        varchar address_street
        varchar address_number
        varchar address_neighborhood
        varchar address_city
        char address_state
        varchar address_zip_code
        varchar address_complement
        timestamptz created_at
        timestamptz updated_at
    }
    VEHICLES {
        uuid id PK
        uuid customer_id FK
        varchar license_plate UK
        varchar model
        varchar brand
        smallint year
        timestamptz created_at
        timestamptz updated_at
    }
    USERS {
        uuid id PK
        varchar name
        varchar email UK
        varchar password_hash
        user_role role
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }
    SERVICES {
        uuid id PK
        varchar name
        text description
        numeric price
        integer duration_in_minutes
        boolean is_active
        integer completed_count
        bigint total_execution_time_ms
        timestamptz created_at
        timestamptz updated_at
    }
    AUTO_PARTS {
        uuid id PK
        varchar name
        text description
        numeric price
        integer stock
        boolean is_active
        timestamptz created_at
        timestamptz updated_at
    }
    SERVICE_ORDERS {
        uuid id PK
        uuid customer_id FK
        uuid vehicle_id FK
        service_order_status status
        numeric quote_services_total
        numeric quote_auto_parts_total
        numeric quote_total
        timestamptz created_at
        timestamptz updated_at
        timestamptz approved_at
        timestamptz started_at
        timestamptz completed_at
        timestamptz delivered_at
    }
    SERVICE_ORDER_SERVICE_ITEMS {
        uuid id PK
        uuid service_order_id FK
        uuid service_id FK
        numeric price
        text description
        boolean is_completed
        timestamptz finished_at
        bigint execution_time_ms
        timestamptz created_at
        timestamptz updated_at
    }
    SERVICE_ORDER_AUTO_PART_ITEMS {
        uuid id PK
        uuid service_order_id FK
        uuid auto_part_id FK
        integer quantity
        numeric unit_price
        numeric total_price
        text description
    }
    STOCK_MOVEMENTS {
        uuid id PK
        uuid auto_part_id FK
        integer quantity
        stock_movement_type type
        uuid service_order_id FK
        timestamptz created_at
    }
```

`users` ainda não possui FK para `customers`. A associação prevista para o login
por CPF está descrita em [database.md](../database.md#evolucao-de-autenticacao)
e [RFC 0001](../rfcs/0001-auth-cpf-lambda-gateway.md), mas não faz parte do
modelo atual.

## Cardinalidades e exclusão

As linhas representam FKs SQL. A cardinalidade junto a cada tabela indica quantos
registros dela podem corresponder a um registro da outra ponta. `1` significa
exatamente um; `0..1`, zero ou um; `0..*`, zero ou muitos. A linha tracejada no
PNG/SVG destaca a FK opcional de movimentação para OS. A coluna **NULO** marca
com `sim` os campos que aceitam NULL; os demais são obrigatórios.

| Pai | FK na tabela filha | Pais por filho | Filhos por pai | ON DELETE |
| --- | --- | --- | --- | --- |
| customers | vehicles.customer_id | 1 | 0..* | CASCADE |
| customers | service_orders.customer_id | 1 | 0..* | NO ACTION |
| vehicles | service_orders.vehicle_id | 1 | 0..* | NO ACTION |
| service_orders | service_order_service_items.service_order_id | 1 | 0..* | CASCADE |
| services | service_order_service_items.service_id | 1 | 0..* | NO ACTION |
| service_orders | service_order_auto_part_items.service_order_id | 1 | 0..* | CASCADE |
| auto_parts | service_order_auto_part_items.auto_part_id | 1 | 0..* | NO ACTION |
| auto_parts | stock_movements.auto_part_id | 1 | 0..* | NO ACTION |
| service_orders | stock_movements.service_order_id | 0..1 | 0..* | SET NULL |

`NO ACTION` é o comportamento padrão quando a migration não declara uma ação.
Nenhuma FK impõe a existência de pelo menos um filho. Uma OS pode, portanto,
existir sem itens no banco, independentemente das regras da aplicação.
As relações N:N entre OS e serviços/peças são representadas pelas tabelas de itens.
Não há UNIQUE composto sobre os pares de FKs dessas tabelas.

As FKs de `service_orders.customer_id` e `vehicle_id` são independentes: as
migrations não garantem que o cliente da OS seja o proprietário do veículo.
`public.migrations` é controle do engine, fora do schema de domínio `bunzina`,
e não está incluída no desenho.
