# ADR 0015 — RabbitMQ como broker de mensageria

- Status: Aceita
- Data: Fase 4

## Contexto

A saga orquestrada da [ADR 0013](./0013-orchestrated-saga.md) precisa de um broker para
os comandos e eventos entre os quatro serviços. O cenário que o vídeo precisa demonstrar
é uma falha de execução após pagamento confirmado, com estorno — ou seja, o caminho de
falha precisa ser ensaiado antes da gravação, não improvisado.

## Decisão

RabbitMQ no cluster, instalado por Helm, e o mesmo broker no `docker-compose.yml` local.

Topologia:

- Exchange `bunzina.events`, tipo `topic`, durável.
- Uma fila por serviço consumidor, com binding por prefixo:
  - `bunzina-os.inbox` ← `evt.workshop.*`, `evt.billing.*`
  - `bunzina-billing.inbox` ← `cmd.billing.*`
  - `bunzina-workshop.inbox` ← `cmd.workshop.*`
- DLQ por fila via `x-dead-letter-exchange`, com alerta sobre profundidade maior que zero.
- Mensagens persistentes, publisher confirms ligado, ack manual após a transação de
  negócio.

O nome da mensagem é a própria routing key: `cmd.<serviço>.<ação>` e
`evt.<contexto>.<fato-no-passado>`. Assinar `evt.billing.*` sai de graça, sem tabela
de-para.

## Motivo

- Paridade entre desenvolvimento e produção: o mesmo broker roda local, o que permite
  ensaiar falha e compensação antes de gravar.
- O `topic` exchange dá o roteamento por prefixo sem configuração adicional por mensagem.
- DLQ nativa, que é onde a compensação travada precisa parar para virar alerta em vez de
  laço infinito.

## Consequências

- Mais um workload para operar no cluster, disputando cota com EKS, PostgreSQL e MongoDB.
  A medição dessa cota precisa acontecer antes de investir na infraestrutura.
- A propagação de contexto de trace passa a ser responsabilidade da aplicação: o
  publisher injeta o `traceparent` W3C nos headers AMQP e o consumer o extrai. Sem isso o
  trace distribuído quebra em cada salto assíncrono.
- Cada serviço precisa de `processed_events` para descartar redelivery. Sem idempotência,
  um redelivery cobra o cliente duas vezes.

## Alternativas

- **SQS + SNS** — elimina a operação do broker e a disputa por cota, mas não tem paridade
  local sem LocalStack ou ElasticMQ. Fica como plano B se a cota do AWS Academy não
  comportar o RabbitMQ.
- **Kafka** — desproporcional ao tamanho do cluster e ao prazo. O projeto não tem volume
  nem necessidade de reprocessar log.
