# Contratos de eventos da saga — Fase 4

Data: 2026-09-17
Status: aprovado, pronto para plano de implementação

Define as mensagens trocadas entre os microsserviços da Fase 4 e as regras que valem
para todas elas. É o documento que precisa estar congelado antes de `bunzina-os`,
`bunzina-billing` e `bunzina-workshop` serem desenvolvidos em paralelo.

## Contexto

O monólito atual resolve o ciclo da ordem de serviço em uma única transação Postgres.
A Fase 4 exige quebrar isso em três serviços com bancos próprios e costurar o fluxo com
Saga Pattern. Este documento é a interface entre eles.

Três características do domínio atual condicionaram o desenho:

1. O orçamento é calculado na criação da OS, a partir dos itens que o cliente informa
   (`src/application/use-cases/service-order/create.ts`). Ele não nasce no Billing.
2. Não existe conceito de pagamento em nenhum lugar do domínio. Ele precisa ser
   inserido num fluxo que não o previa.
3. A oficina participa duas vezes: `IN_DIAGNOSTIC` acontece antes de
   `AWAITING_APPROVAL`, e `IN_EXECUTION` depois
   (`src/domain/service-order/state-machines/status-machine.ts`).

## Decisões

| Decisão | Escolha | Motivo |
|---|---|---|
| Posição do pagamento | Entre a aprovação e a execução | Compensação limpa: se o pagamento falha, nada foi executado. Se a execução falha, existe estorno real para demonstrar. |
| Dono do orçamento final | Billing | O diagnóstico altera os itens; o orçamento que vai para aprovação é o pós-diagnóstico. Dá substância ao Billing em vez de deixá-lo como proxy do Mercado Pago. |
| API de aprovação | Billing | Quem é dono do dado recebe a escrita sobre ele. |
| Estilo da saga | Orquestrada, com o OS Service no comando | O vídeo precisa demonstrar execução e falha da saga; estado em tabela é mais demonstrável que fluxo de eventos disperso. |
| Comandos vs eventos | Separados | Saga orquestrada sem essa distinção vira "eventos que na verdade são ordens". |

### Estado novo na máquina de status

Apenas `AWAITING_PAYMENT`, entre `AWAITING_APPROVAL` e `IN_EXECUTION`:

```
RECEIVED → IN_DIAGNOSTIC → AWAITING_APPROVAL → AWAITING_PAYMENT
         → IN_EXECUTION → COMPLETED → DELIVERED
                                    ↘ CANCELED
```

A transição `AWAITING_APPROVAL → RECEIVED`, que já existe como direção `BACK`, passa a
ser o caminho da recusa de orçamento.

## Convenções

### Comandos e eventos

- **Comando** — imperativo, um destinatário, pode ser recusado: `cmd.billing.issue-quote`
- **Evento** — fato consumado, N ouvintes, não se recusa: `evt.billing.quote-issued`

Apenas o OS Service publica comandos. Qualquer serviço publica eventos.

### Nomes

Formato `cmd.<serviço>.<ação>` e `evt.<contexto>.<fato-no-passado>`, em kebab-case,
separado por pontos. Os pontos não são estética: no topic exchange do RabbitMQ o nome
da mensagem é a própria routing key, então `evt.billing.*` funciona como assinatura
sem tabela de-para.

### Envelope

Todas as mensagens, comandos e eventos, usam o mesmo envelope:

```jsonc
{
  "eventId":       "0193f2a1-4c7e-7000-8000-000000000001",
  "eventType":     "evt.billing.quote-issued",
  "eventVersion":  1,
  "occurredAt":    "2026-09-17T14:03:22.115Z",
  "correlationId": "<serviceOrderId>",
  "causationId":   "<eventId da mensagem que causou esta>",
  "producer":      "bunzina-billing",
  "traceparent":   "00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01",
  "data":          { }
}
```

- `eventId` — UUID v7. É a chave de idempotência, não um identificador decorativo.
  A ordenação temporal do v7 mantém o índice saudável.
- `correlationId` — sempre o `serviceOrderId`. Não existe id de saga separado: a OS já
  é a unidade de negócio do fluxo, e usar o id dela permite filtrar no Grafana por um
  valor que o atendente da oficina sabe ler.
- `causationId` — o `eventId` da mensagem anterior na cadeia. Permite reconstruir a
  árvore da saga a partir do log, que é o que se quer na hora de explicar uma
  compensação.
- `traceparent` — W3C, duplicado no header AMQP. O header é o que o OpenTelemetry lê
  automaticamente; o do envelope serve para quem abrir a mensagem na DLQ.

### Versionamento

`eventVersion` começa em 1. A regra é mudança somente aditiva: campo novo entra
opcional, campo existente nunca é removido nem muda de tipo. Uma quebra real incrementa
a versão e é coordenada no PR entre os serviços envolvidos.

Não haverá dual publishing nem negociação de versão em runtime. No prazo desta entrega
isso é cerimônia que não se paga.

### Idempotência

Cada serviço mantém:

```sql
processed_events (
  event_id   uuid not null,
  consumer   text not null,
  handled_at timestamptz not null default now(),
  primary key (event_id, consumer)
)
```

O consumer insere nessa tabela **na mesma transação** da escrita de negócio. Violação de
chave primária significa mensagem já processada: faz ack e encerra sem efeito.

Sem isso, um redelivery do RabbitMQ cobra o cliente duas vezes. Vale igualmente para as
compensações: estornar duas vezes é pior que o problema original.

No `bunzina-workshop`, que usa MongoDB, o equivalente é uma coleção `processed_events`
com índice único em `{ eventId, consumer }`.

### Tipos de dado

- Dinheiro: inteiro em centavos, com moeda explícita — `totalCents: 54500`,
  `currency: "BRL"`. O domínio atual usa `number` com decimais, o que funcionava dentro
  de um processo só; atravessando JSON entre três serviços e o Mercado Pago vira erro
  de arredondamento. A fronteira é o lugar de corrigir.
- Datas: ISO 8601 em UTC.
- Identificadores: UUID em string.
- `reason`: enum, nunca texto livre. Valores: `PART_UNAVAILABLE`, `EXPIRED`,
  `REJECTED`, `TIMEOUT`, `PROVIDER_ERROR`, `CUSTOMER_REQUEST`, `UNREPAIRABLE`. O campo
  `detail`, ao lado, é livre para leitura humana. Motivo em texto solto impede agrupar
  falha por causa no dashboard, que é justamente o gráfico que torna a saga
  demonstrável.

### Regras de payload

- Nenhuma entidade viaja inteira. Cada mensagem leva só o que o consumidor precisa.
- Campos de snapshot (nome do cliente, placa do veículo) são cópias válidas no instante
  do evento. Não são fonte da verdade e não devem ser sincronizados.

## Fluxo

```
Cliente   POST /service-orders                      [OS]
          OS persiste com quote preliminar, RECEIVED
          ⇒ evt.os.order-created

OS        → cmd.workshop.start-diagnostic           OS: IN_DIAGNOSTIC
Mecânico  PATCH /diagnostics/:id                    [WORKSHOP]
          ⇒ evt.workshop.diagnostic-completed

OS        → cmd.billing.issue-quote
          Billing calcula o total, persiste, envia e-mail
          ⇒ evt.billing.quote-issued                OS: AWAITING_APPROVAL

Cliente   POST /quotes/:id/approval                 [BILLING]
          ⇒ evt.billing.quote-approved

OS        → cmd.billing.charge                      OS: AWAITING_PAYMENT
          Billing cria a preferência no Mercado Pago
          e envia o link de checkout ao cliente
Webhook   POST /webhooks/mercadopago                [BILLING]
          ⇒ evt.billing.payment-confirmed

OS        → cmd.workshop.start-execution            OS: IN_EXECUTION
Mecânico  PATCH /executions/:id/items               [WORKSHOP]
          ⇒ evt.workshop.execution-completed        OS: COMPLETED

Atendente POST /service-orders/:id/delivery         [OS] → DELIVERED
```

Duas observações sobre o desenho do fluxo:

**O `cmd.billing.charge` após o `evt.billing.quote-approved` é intencionalmente um ida e
volta.** O Billing poderia cobrar por conta própria ao aprovar, mas entre a aprovação e
a cobrança a OS pode ter sido cancelada, e só o orquestrador sabe disso. O custo de uma
mensagem evita estornar um pagamento que nunca deveria ter existido.

**As ações humanas são REST, não mensagem.** Aprovar orçamento, pagar e concluir item de
execução entram por HTTP. Mensageria é para o que acontece entre serviços. Isso também
mantém o teste BDD determinístico: o passo humano é uma chamada síncrona, não uma
publicação manual na fila.

## Catálogo de mensagens

20 mensagens. O envelope é implícito em todas; abaixo está apenas o conteúdo de `data`.

### Comandos do caminho feliz

**`cmd.workshop.start-diagnostic`** — OS → Workshop
```jsonc
{
  "serviceOrderId": "uuid",
  "vehicle": { "id": "uuid", "plate": "ABC1D23", "model": "Gol 1.6" },
  "requestedItems": {
    "services":  [{ "serviceId": "uuid", "description": "string", "priceCents": 12000 }],
    "autoParts": [{ "autoPartId": "uuid", "description": "string",
                    "quantity": 1, "unitPriceCents": 4500 }]
  },
  "currency": "BRL"
}
```

**`cmd.billing.issue-quote`** — OS → Billing
```jsonc
{
  "serviceOrderId": "uuid",
  "customer": { "id": "uuid", "name": "string",
                "document": "string", "email": "string" },
  "items": {
    "services":  [{ "serviceId": "uuid", "description": "string", "priceCents": 12000 }],
    "autoParts": [{ "autoPartId": "uuid", "description": "string",
                    "quantity": 1, "unitPriceCents": 4500 }]
  },
  "currency": "BRL"
}
```

**`cmd.billing.charge`** — OS → Billing
```jsonc
{
  "serviceOrderId": "uuid",
  "quoteId": "uuid",
  "totalCents": 54500,
  "currency": "BRL",
  "customer": { "id": "uuid", "name": "string",
                "document": "string", "email": "string" }
}
```

**`cmd.workshop.start-execution`** — OS → Workshop
```jsonc
{
  "serviceOrderId": "uuid",
  "items": {
    "services":  [{ "serviceId": "uuid", "description": "string" }],
    "autoParts": [{ "autoPartId": "uuid", "description": "string", "quantity": 1 }]
  }
}
```

### Comandos de compensação

**`cmd.billing.cancel-quote`** — OS → Billing
```jsonc
{ "serviceOrderId": "uuid", "quoteId": "uuid",
  "reason": "TIMEOUT", "detail": "string" }
```

**`cmd.billing.refund`** — OS → Billing
```jsonc
{ "serviceOrderId": "uuid", "paymentId": "uuid", "amountCents": 54500,
  "currency": "BRL", "reason": "PART_UNAVAILABLE", "detail": "string" }
```

**`cmd.workshop.abort`** — OS → Workshop
```jsonc
{ "serviceOrderId": "uuid", "reason": "TIMEOUT", "detail": "string" }
```

### Eventos do caminho feliz

**`evt.os.order-created`** — notificação e observabilidade apenas
```jsonc
{
  "serviceOrderId": "uuid",
  "customer": { "id": "uuid", "name": "Ana Souza",
                "document": "12345678901", "email": "ana@ex.com" },
  "vehicle":  { "id": "uuid", "plate": "ABC1D23", "model": "Gol 1.6" },
  "requestedItems": {
    "services":  [{ "serviceId": "uuid", "description": "Troca de óleo",
                    "priceCents": 12000 }],
    "autoParts": [{ "autoPartId": "uuid", "description": "Filtro de óleo",
                    "quantity": 1, "unitPriceCents": 4500 }]
  },
  "preliminaryTotalCents": 16500,
  "currency": "BRL"
}
```

**`evt.workshop.diagnostic-completed`** — a oficina devolve os itens reais
```jsonc
{
  "serviceOrderId": "uuid",
  "diagnosedItems": {
    "services":  [{ "serviceId": "uuid", "description": "Troca de óleo",
                    "priceCents": 12000 },
                  { "serviceId": "uuid", "description": "Troca de correia",
                    "priceCents": 38000 }],
    "autoParts": [{ "autoPartId": "uuid", "description": "Filtro de óleo",
                    "quantity": 1, "unitPriceCents": 4500 }]
  },
  "notes": "Correia dentada com folga acima do limite",
  "diagnosedBy": "mecanico-07",
  "currency": "BRL"
}
```

**`evt.billing.quote-issued`**
```jsonc
{
  "serviceOrderId": "uuid",
  "quoteId": "uuid",
  "servicesTotalCents": 50000,
  "autoPartsTotalCents": 4500,
  "totalCents": 54500,
  "currency": "BRL",
  "expiresAt": "2026-09-20T14:03:22.115Z"
}
```

**`evt.billing.quote-approved`**
```jsonc
{
  "serviceOrderId": "uuid",
  "quoteId": "uuid",
  "totalCents": 54500,
  "currency": "BRL",
  "approvedBy": "12345678901",
  "approvedAt": "2026-09-17T14:20:00.000Z"
}
```

**`evt.billing.payment-confirmed`**
```jsonc
{
  "serviceOrderId": "uuid",
  "paymentId": "uuid",
  "quoteId": "uuid",
  "provider": "mercadopago",
  "providerPaymentId": "1234567890",
  "amountCents": 54500,
  "currency": "BRL",
  "method": "pix",
  "paidAt": "2026-09-17T14:31:08.000Z"
}
```

**`evt.workshop.execution-completed`**
```jsonc
{
  "serviceOrderId": "uuid",
  "completedItems": [
    { "serviceId": "uuid", "finishedAt": "2026-09-17T16:00:00.000Z",
      "executionTimeMs": 5400000 }
  ],
  "completedAt": "2026-09-17T16:00:00.000Z"
}
```

O campo `executionTimeMs` já existe em `src/domain/service-order/entities/service-item.ts`.
Propagá-lo no evento alimenta sem custo adicional o dashboard de tempo médio por status
que ficou pendente da Fase 3.

### Eventos de desfecho e de falha

**`evt.billing.quote-rejected`** — desfecho de negócio, **não é falha**
```jsonc
{ "serviceOrderId": "uuid", "quoteId": "uuid",
  "reason": "CUSTOMER_REQUEST", "detail": "string",
  "rejectedBy": "12345678901" }
```

O cliente recusar o orçamento é um desfecho legítimo. Leva a OS de volta a `RECEIVED`
pela transição `BACK` já existente e não dispara compensação nenhuma. Tratar isso como
falha faria o painel mostrar taxa de erro alta num sistema saudável.

**`evt.workshop.diagnostic-failed`**
```jsonc
{ "serviceOrderId": "uuid", "reason": "UNREPAIRABLE", "detail": "string" }
```

**`evt.billing.payment-failed`**
```jsonc
{ "serviceOrderId": "uuid", "paymentId": "uuid", "quoteId": "uuid",
  "reason": "EXPIRED", "detail": "string",
  "providerStatus": "string" }
```

**`evt.workshop.execution-failed`**
```jsonc
{
  "serviceOrderId": "uuid",
  "reason": "PART_UNAVAILABLE",
  "detail": "Correia dentada sem estoque no fornecedor",
  "failedItems": [{ "serviceId": "uuid" }]
}
```

### Eventos de compensação concluída

**`evt.billing.quote-canceled`**
```jsonc
{ "serviceOrderId": "uuid", "quoteId": "uuid",
  "canceledAt": "2026-09-17T15:00:00.000Z" }
```

**`evt.billing.payment-refunded`**
```jsonc
{
  "serviceOrderId": "uuid",
  "paymentId": "uuid",
  "providerRefundId": "9876543210",
  "amountCents": 54500,
  "currency": "BRL",
  "refundedAt": "2026-09-17T17:00:00.000Z"
}
```

**`evt.workshop.execution-aborted`**
```jsonc
{ "serviceOrderId": "uuid", "abortedAt": "2026-09-17T16:55:00.000Z" }
```

### Fora do escopo da saga

`evt.os.order-created`, `evt.os.order-delivered` e `evt.os.order-canceled` são publicados
para notificação e observabilidade. Nenhum passo da saga depende deles.

O `evt.os.order-created` em particular não é consumido por Workshop nem por Billing: os
dados de que eles precisam chegam depois, nos comandos `cmd.workshop.start-diagnostic` e
`cmd.billing.issue-quote`. Ele existe para que o serviço de notificação e os dashboards
saibam que a OS nasceu.

## Falhas e compensação

### O que compensar depende de onde a saga chegou

| Falhou tendo chegado até | Compensa | Motivo |
|---|---|---|
| `order-created` | nada | nada aconteceu fora do OS |
| `diagnostic` | `cmd.workshop.abort` | libera a vaga na fila da oficina |
| `quote-issued` | `cmd.billing.cancel-quote` | invalida o orçamento pendente |
| `payment-confirmed` | `cmd.billing.refund` | há dinheiro do cliente retido |
| `execution` iniciada | `cmd.workshop.abort` e depois `cmd.billing.refund` | ordem reversa |

É por isso que o estado da saga guarda os passos concluídos, e não apenas o passo atual.

### Cenário de demonstração

Pagamento confirmado seguido de falha na execução é o único ponto do fluxo com dinheiro
real a estornar, e é o cenário a gravar:

```
evt.workshop.execution-failed   { reason: "PART_UNAVAILABLE" }
  → saga: RUNNING → COMPENSATING
  → cmd.workshop.abort          ⇒ evt.workshop.execution-aborted
  → cmd.billing.refund          ⇒ evt.billing.payment-refunded
  → OS: CANCELED, saga: FAILED
```

### Estado da saga

```sql
saga_instances (
  service_order_id  uuid primary key,
  status            text not null,   -- RUNNING | COMPENSATING | COMPLETED | FAILED
  current_step      text not null,
  completed_steps   jsonb not null default '[]',
  step_deadline_at  timestamptz,
  last_error        text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
)
```

### Timeout

Todo passo tem prazo em `step_deadline_at`. Um job no OS varre os prazos vencidos e
dispara a compensação com `reason: "TIMEOUT"`. Sem isso, um Workshop que morreu no meio
deixa a OS pendurada indefinidamente.

O prazo do pagamento acompanha a expiração do PIX no Mercado Pago. Os demais passos usam
prazos bem mais curtos.

### Falha na compensação

Retry com backoff exponencial. Esgotadas as tentativas, a mensagem vai para a DLQ e
dispara alerta.

Não existe compensar a compensação: tentar isso gera laço infinito. Um estorno que não
completou é problema humano, e a DLQ com alerta é a resposta correta.

## Topologia RabbitMQ

- Exchange `bunzina.events`, tipo `topic`, durável.
- Uma fila por serviço consumidor, com binding por prefixo:
  - `bunzina-os.inbox` ← `evt.workshop.*`, `evt.billing.*`
  - `bunzina-billing.inbox` ← `cmd.billing.*`
  - `bunzina-workshop.inbox` ← `cmd.workshop.*`
- Cada fila tem DLQ correspondente via `x-dead-letter-exchange`, com alerta sobre
  profundidade maior que zero.
- Mensagens persistentes, publisher confirms ligado, consumo com ack manual após a
  transação de negócio.

## Critérios de aceite

1. Os três serviços compartilham a mesma definição de envelope, validada por schema Zod.
2. Um `serviceOrderId` filtra a saga inteira nos logs e no Tempo.
3. Republicar qualquer mensagem do catálogo não produz efeito adicional.
4. O cenário de falha de execução após pagamento confirmado resulta em estorno registrado
   no Mercado Pago e OS em `CANCELED`.
5. Um passo que estoura o prazo dispara a mesma compensação que uma falha explícita.
6. O trace atravessa OS, Billing e Workshop sem quebrar nos saltos por RabbitMQ.

## O que este documento não decide

- Nome e formato do tópico de notificação para o serviço de Cadastros.
- Política de retry por tipo de falha do Mercado Pago, que depende de teste no sandbox.
- Se o webhook do Mercado Pago será exposto por Ingress do EKS ou por túnel durante a
  gravação.
