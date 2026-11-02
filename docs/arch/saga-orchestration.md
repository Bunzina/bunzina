# Saga orquestrada da ordem de serviço

Este documento descreve o fluxo distribuído da ordem de serviço na Fase 4.
O `bunzina-os` é o orquestrador: persiste o estado da saga, publica comandos e reage
aos eventos publicados pelo Billing e pelo Workshop.

O `serviceOrderId` é o `correlationId` de todas as mensagens.

## Componentes

- **bunzina**: valida cliente, veículo e serviços por REST.
- **bunzina-os**: mantém a ordem de serviço e orquestra a saga.
- **bunzina-billing**: gera orçamento, recebe aprovação e processa pagamento.
- **bunzina-workshop**: gerencia diagnóstico, fila de execução e reparos.
- **RabbitMQ**: transporta comandos, eventos e mensagens de compensação.
- **PostgreSQL do OS**: mantém a ordem e a tabela `saga_instances`.
- **PostgreSQL do Billing**: mantém orçamentos e pagamentos.
- **MongoDB do Workshop**: mantém a fila e os logs de execução.

## Caminho feliz

```mermaid
sequenceDiagram
    actor Cliente
    participant OS as bunzina-os\nOrquestrador
    participant Cad as bunzina\nCadastros
    participant MQ as RabbitMQ
    participant W as bunzina-workshop
    participant B as bunzina-billing

    Cliente->>OS: POST /service-orders
    OS->>Cad: Valida cliente, veículo e serviços
    Cad-->>OS: Dados válidos + snapshots
    OS->>OS: Persiste OS e saga_instances
    OS->>MQ: cmd.workshop.start-diagnostic

    MQ->>W: Entrega comando
    W->>W: Registra diagnóstico
    W-->>MQ: evt.workshop.diagnostic-completed
    MQ->>OS: Diagnóstico concluído

    OS->>MQ: cmd.billing.issue-quote
    MQ->>B: Entrega comando
    B->>B: Calcula e persiste orçamento
    B-->>MQ: evt.billing.quote-issued
    MQ->>OS: Orçamento gerado
    OS-->>Cliente: Orçamento disponível

    Cliente->>B: POST /quotes/:id/approval
    B-->>MQ: evt.billing.quote-approved
    MQ->>OS: Orçamento aprovado

    OS->>MQ: cmd.billing.charge
    MQ->>B: Solicita pagamento
    B->>B: Cria preferência no Mercado Pago
    B-->>Cliente: Link de pagamento
    Cliente->>B: Efetua pagamento
    B-->>MQ: evt.billing.payment-confirmed
    MQ->>OS: Pagamento confirmado

    OS->>MQ: cmd.workshop.start-execution
    MQ->>W: Inicia execução
    W->>W: Mecânico realiza reparo
    W-->>MQ: evt.workshop.execution-completed
    MQ->>OS: Execução concluída

    OS->>OS: Atualiza OS para COMPLETED
    Cliente->>OS: POST /service-orders/:id/delivery
    OS->>OS: Atualiza OS para DELIVERED
```

## Falha e compensação

Neste exemplo, o pagamento foi confirmado, mas uma peça ficou indisponível durante
a execução. O orquestrador precisa desfazer o pagamento e cancelar a ordem.

```mermaid
sequenceDiagram
    participant OS as bunzina-os\nOrquestrador
    participant MQ as RabbitMQ
    participant B as bunzina-billing
    participant W as bunzina-workshop

    OS->>MQ: cmd.billing.charge
    MQ->>B: Processa cobrança
    B-->>MQ: evt.billing.payment-confirmed
    MQ->>OS: Pagamento confirmado

    OS->>MQ: cmd.workshop.start-execution
    MQ->>W: Inicia execução
    W-->>MQ: evt.workshop.execution-failed
    MQ->>OS: Execução falhou

    OS->>OS: Saga = COMPENSATING
    OS->>MQ: cmd.billing.refund
    MQ->>B: Solicita estorno
    B->>B: Executa refund no Mercado Pago
    B-->>MQ: evt.billing.payment-refunded
    MQ->>OS: Estorno confirmado

    OS->>OS: Saga = COMPENSATED
    OS->>OS: OS = CANCELED
```

## Estados da saga

```mermaid
stateDiagram-v2
    [*] --> RECEIVED
    RECEIVED --> DIAGNOSTIC_IN_PROGRESS
    DIAGNOSTIC_IN_PROGRESS --> QUOTE_PENDING
    QUOTE_PENDING --> AWAITING_APPROVAL
    AWAITING_APPROVAL --> AWAITING_PAYMENT: QuoteApproved
    AWAITING_APPROVAL --> RECEIVED: QuoteRejected
    AWAITING_PAYMENT --> PAYMENT_CONFIRMED: PaymentConfirmed
    PAYMENT_CONFIRMED --> IN_EXECUTION: ExecutionRequested
    IN_EXECUTION --> COMPLETED: ExecutionCompleted
    COMPLETED --> DELIVERED

    AWAITING_PAYMENT --> COMPENSATING: PaymentFailed/Timeout
    IN_EXECUTION --> COMPENSATING: ExecutionFailed/Timeout
    COMPENSATING --> CANCELED: CompensationCompleted
    COMPENSATING --> COMPENSATION_FAILED: CompensationError
    COMPENSATION_FAILED --> [*]: DLQ + alerta
    DELIVERED --> [*]
    CANCELED --> [*]
```

## Registro da saga

A tabela `saga_instances` deve manter o progresso suficiente para decidir quais
compensações são necessárias:

```text
service_order_id: 123
status: COMPENSATED
completed_steps:
  - DIAGNOSTIC
  - QUOTE
  - PAYMENT
compensated_steps:
  - PAYMENT
failure_reason: PART_UNAVAILABLE
```

Cada mensagem também deve carregar `eventId`, `eventType`, `eventVersion`,
`correlationId`, `causationId`, `producer`, `occurredAt` e `traceparent`.

## Regras de compensação

| Falha | Compensação |
| --- | --- |
| Falha ou timeout no diagnóstico | Cancela o fluxo, sem cobrança |
| Recusa do orçamento | Retorna a OS para `RECEIVED`; não é falha técnica |
| Falha ou timeout no pagamento | Cancela o orçamento |
| Falha ou timeout na execução após pagamento | Aborta a execução e solicita estorno |
| Falha na compensação | Envia para a DLQ e gera alerta |

Os consumidores devem gravar cada mensagem processada em `processed_events` antes
de confirmar o `ack`. Assim, um redelivery não gera cobrança ou estorno duplicado.

## Referências

- [ADR 0013 - Saga orquestrada](0013-orchestrated-saga.md)
- [ADR 0015 - RabbitMQ](0015-rabbitmq-broker.md)
- [Contratos de eventos da saga](../contracts/events-saga-contracts.md)
