# Contratos de eventos — visão geral

Resumo para apresentação ao time. O detalhamento com todos os payloads está em
[Contratos de eventos da saga](./events-saga-contracts.md).

## O que decidimos

| Ponto | Decisão |
|---|---|
| Saga | Orquestrada, com o OS Service no comando |
| Pagamento | Entre a aprovação do orçamento e a execução |
| Dono do orçamento final | Billing, depois do diagnóstico |
| Aprovação do cliente | API do Billing |
| Broker | RabbitMQ, topic exchange |

Só um status novo na máquina: **`AWAITING_PAYMENT`**, entre `AWAITING_APPROVAL` e
`IN_EXECUTION`. O resto do `status-machine.ts` continua como está.

## Comando e evento são coisas diferentes

- **Comando** — ordem para um serviço, pode ser recusada: `cmd.billing.issue-quote`
- **Evento** — fato já ocorrido, não se recusa: `evt.billing.quote-issued`

Só o OS publica comandos. Qualquer serviço publica eventos.

Os nomes usam ponto porque no RabbitMQ o nome **é** a routing key: assinar
`evt.billing.*` funciona de graça.

## Envelope

Todas as mensagens têm o mesmo formato. O que muda é só o `data`.

```jsonc
{
  "eventId":       "uuid v7",        // chave de idempotência
  "eventType":     "evt.billing.quote-issued",
  "eventVersion":  1,
  "occurredAt":    "ISO 8601 UTC",
  "correlationId": "<serviceOrderId>",   // costura a saga inteira
  "causationId":   "<eventId anterior>", // reconstrói a cadeia no log
  "producer":      "bunzina-billing",
  "traceparent":   "00-...",             // W3C, também no header AMQP
  "data":          { }
}
```

Três regras que valem para todo mundo:

- **Dinheiro em centavos inteiros** + `currency`. Nada de decimal atravessando JSON.
- **`reason` é enum**, nunca texto livre. O `detail` ao lado é livre para humano.
- **Nada de entidade inteira**: cada mensagem leva só o que o consumidor precisa.

## O fluxo

```
Cliente  POST /service-orders                    [OS]      RECEIVED
         ⇒ evt.os.order-created

OS       → cmd.workshop.start-diagnostic                   IN_DIAGNOSTIC
Mecânico PATCH /diagnostics/:id                  [WORKSHOP]
         ⇒ evt.workshop.diagnostic-completed     (itens reais)

OS       → cmd.billing.issue-quote               [BILLING]
         ⇒ evt.billing.quote-issued                        AWAITING_APPROVAL

Cliente  POST /quotes/:id/approval               [BILLING]
         ⇒ evt.billing.quote-approved

OS       → cmd.billing.charge                              AWAITING_PAYMENT
Webhook  POST /webhooks/mercadopago              [BILLING]
         ⇒ evt.billing.payment-confirmed

OS       → cmd.workshop.start-execution                    IN_EXECUTION
Mecânico PATCH /executions/:id/items             [WORKSHOP]
         ⇒ evt.workshop.execution-completed                COMPLETED

Atendente POST /service-orders/:id/delivery      [OS]      DELIVERED
```

Duas coisas para explicar na apresentação:

**O diagnóstico faz parte da saga.** A oficina entra duas vezes: diagnostica antes do
orçamento e executa depois do pagamento. É o diagnóstico que muda os itens, e é por isso
que o orçamento final é emitido pelo Billing, não pelo OS.

**Ação humana é REST, não mensagem.** Aprovar, pagar e concluir item entram por HTTP.
Mensageria é só entre serviços.

## As 20 mensagens

**Comandos do caminho feliz (4)**
`cmd.workshop.start-diagnostic` · `cmd.billing.issue-quote` · `cmd.billing.charge` ·
`cmd.workshop.start-execution`

**Comandos de compensação (3)**
`cmd.billing.cancel-quote` · `cmd.billing.refund` · `cmd.workshop.abort`

**Eventos do caminho feliz (6)**
`evt.os.order-created` · `evt.workshop.diagnostic-completed` ·
`evt.billing.quote-issued` · `evt.billing.quote-approved` ·
`evt.billing.payment-confirmed` · `evt.workshop.execution-completed`

**Eventos de desfecho e falha (4)**
`evt.billing.quote-rejected` · `evt.workshop.diagnostic-failed` ·
`evt.billing.payment-failed` · `evt.workshop.execution-failed`

**Eventos de compensação concluída (3)**
`evt.billing.quote-canceled` · `evt.billing.payment-refunded` ·
`evt.workshop.execution-aborted`

## Compensação

**Recusar orçamento não é falha.** O cliente recusar é desfecho normal: a OS volta para
`RECEIVED` e ninguém compensa nada. Se tratarmos como erro, o dashboard vai mostrar
falha num sistema saudável.

O que compensar depende de até onde a saga chegou:

| Chegou até | Compensa |
|---|---|
| OS criada | nada |
| diagnóstico | `cmd.workshop.abort` |
| orçamento emitido | `cmd.billing.cancel-quote` |
| pagamento confirmado | `cmd.billing.refund` |
| execução iniciada | `cmd.workshop.abort` + `cmd.billing.refund` |

Por isso o `saga_instances` guarda os **passos concluídos**, não só o passo atual.

**Timeout é falha.** Todo passo tem prazo; vencido, compensa igual.

**Compensação que falha vai para a DLQ com alerta.** Não existe compensar a
compensação — isso vira laço infinito. Estorno travado é problema humano.

## Idempotência

Cada serviço tem `processed_events` com PK `(event_id, consumer)`, gravado **na mesma
transação** da escrita de negócio. Chave duplicada = já processei, dá ack e ignora.

Sem isso, um redelivery do RabbitMQ cobra o cliente duas vezes.

## O cenário do vídeo

Pagamento confirmado e execução falha — o único ponto com dinheiro real a estornar:

```
evt.workshop.execution-failed  { reason: "PART_UNAVAILABLE" }
  → saga: RUNNING → COMPENSATING
  → cmd.workshop.abort         ⇒ evt.workshop.execution-aborted
  → cmd.billing.refund         ⇒ evt.billing.payment-refunded
  → OS: CANCELED, saga: FAILED
```

Na tela: a linha do `saga_instances` mudando de estado, os dois eventos correlacionados
pelo mesmo `serviceOrderId` e o estorno no painel do Mercado Pago.

## Ainda em aberto

- Política de retry do Mercado Pago (depende de testar o sandbox).
- Webhook exposto por Ingress do EKS ou por túnel na gravação.
- Tópico de notificação para o serviço de Cadastros.
