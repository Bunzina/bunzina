# ADR 0013 — Saga orquestrada com o `bunzina-os` no comando

- Status: Aceita
- Data: Fase 4

## Contexto

Com o recorte da [ADR 0012](./0012-microservices-split.md), o ciclo da ordem de serviço
deixa de caber em uma transação PostgreSQL e passa a atravessar três serviços. O PDF
exige gestão transacional distribuída com Saga Pattern e cobra, explicitamente no README
do serviço, a justificativa da estratégia escolhida.

O vídeo de demonstração precisa mostrar a execução da saga e o tratamento de falhas.

## Decisão

Saga orquestrada, com o `bunzina-os` como orquestrador.

- O estado de cada instância fica em `saga_instances`, com o `service_order_id` como
  chave primária e como `correlationId` de todas as mensagens.
- A tabela guarda os **passos concluídos**, não apenas o passo atual, porque o conjunto
  de compensações depende de até onde a saga chegou.
- Só o orquestrador publica comandos (`cmd.*`); qualquer serviço publica eventos
  (`evt.*`).
- Todo passo tem prazo em `step_deadline_at`; prazo vencido dispara a mesma compensação
  que uma falha explícita, com `reason: "TIMEOUT"`.
- Compensação que falha vai para a DLQ com alerta. Não existe compensar a compensação.

A máquina de estados em `src/domain/service-order/state-machines/status-machine.ts` é a
espinha da saga. Ganha um único status novo, `AWAITING_PAYMENT`, entre
`AWAITING_APPROVAL` e `IN_EXECUTION`.

O catálogo completo das mensagens está em
[Contratos de eventos da saga](../../contracts/events-saga-contracts.md).

## Motivo

- O estado da saga em tabela é demonstrável: na gravação, apontar para uma linha em
  `COMPENSATING` e para o log de compensação explica o mecanismo em segundos. Narrar um
  fluxo de eventos disperso por três serviços, não.
- A máquina de estados já existente e testada vira o modelo da saga sem reescrita.
- A distinção entre comando e evento evita que a coreografia entre pela porta dos
  fundos, na forma de eventos que na verdade são ordens.

## Consequências

- O `bunzina-os` concentra a complexidade do fluxo e vira o ponto único de falha da
  orquestração.
- Um passo a mais de mensagem entre `evt.billing.quote-approved` e `cmd.billing.charge`:
  o Billing poderia cobrar sozinho ao aprovar, mas só o orquestrador sabe se a OS foi
  cancelada nesse intervalo.
- O orquestrador precisa de um job varrendo prazos vencidos, senão um serviço que morreu
  no meio deixa a OS pendurada indefinidamente.
- Recusa de orçamento é desfecho de negócio, não falha: volta a OS para `RECEIVED` pela
  transição `BACK` já existente e não compensa nada.

## Alternativas

- **Coreografia** — menos acoplamento e nenhum ponto central, mas o estado do fluxo fica
  implícito na soma dos serviços. Depurar e demonstrar uma compensação exigiria
  correlacionar logs dos três, o que é exatamente o que o vídeo não tem tempo de fazer.
