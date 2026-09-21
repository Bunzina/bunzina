# ADR 0014 — MongoDB no `bunzina-workshop`

- Status: Aceita
- Data: Fase 4

## Contexto

O PDF exige pelo menos um banco não relacional entre os microsserviços, com
justificativa técnica da escolha. A [ADR 0001](./0001-postgresql.md) mantém o
PostgreSQL como banco dos domínios relacionais, e essa decisão continua válida para
cadastros, ordem de serviço e cobrança.

## Decisão

MongoDB como banco do `bunzina-workshop`, com as coleções `execution_queue` e
`execution_logs`, mais a `processed_events` com índice único em
`{ eventId, consumer }` para idempotência.

Provisionado no cluster espelhando o que o `bunzina-db` já faz para o PostgreSQL:
StatefulSet, PVC, StorageClass e Secret. Também entra no `docker-compose.yml` local.

## Motivo

- É o único serviço cujo dado é genuinamente semiestruturado: o checklist varia por tipo
  de serviço, e o registro do mecânico é anotação livre mais evidências.
- Modelar isso em tabela exigiria ou coluna `jsonb` — que é o documento com outro nome —
  ou uma tabela de atributos por tipo de serviço.
- A troca é local à camada de infraestrutura: as interfaces de repositório vivem no
  domínio, conforme a [ADR 0002](./0002-clean-architecture.md).

## Consequências

- Mais um workload com estado no EKS, com PVC, backup e operação manual próprios.
- A idempotência do Workshop usa índice único em coleção, não chave primária composta.
  A regra de gravar na mesma transação da escrita de negócio precisa de atenção
  redobrada, porque a garantia transacional do Mongo é diferente.
- A documentação de banco passa a ter dois modelos: o ER do PostgreSQL e o modelo de
  documentos do Mongo.

## Alternativas

- **DynamoDB gerenciado** — mantido como plano B se a cota do AWS Academy não comportar
  mais um StatefulSet junto de EKS, PostgreSQL e RabbitMQ. Consome menos nós, ao custo
  de não ter paridade local sem emulador.
- **Coluna `jsonb` no PostgreSQL** — resolveria o dado, mas não atende ao requisito de
  banco não relacional e tornaria a justificativa técnica decorativa.
