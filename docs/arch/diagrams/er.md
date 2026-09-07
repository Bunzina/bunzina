# Diagrama ER

Schema `bunzina`. Tipos ENUM: `document_kind`, `user_role`, `stock_movement_type`, `service_order_status`.

![Modelo ER](../er.png)

`users` ainda não tem FK para `customers`. A Fase 3 precisa associar o CPF do cliente ao usuário de login — ver [RFC 0001](../rfcs/0001-auth-cpf-lambda-gateway.md) e [database.md](../database.md#ajuste-previsto-fase-3).
