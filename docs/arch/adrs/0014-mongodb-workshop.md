# ADR 0014 — MongoDB Atlas no `bunzina-workshop`

- Status: Aceita
- Data: Fase 4

## Contexto

O PDF exige pelo menos um banco não relacional entre os microsserviços, com
justificativa técnica da escolha. A [ADR 0001](./0001-postgresql.md) mantém o
PostgreSQL como banco dos domínios relacionais, e essa decisão continua válida para
cadastros, ordem de serviço e cobrança.

O ambiente é o AWS Academy Learner Lab, com cota limitada. O cluster já carrega EKS,
PostgreSQL e, pela [ADR 0015](./0015-rabbitmq-broker.md), passa a carregar o RabbitMQ.

## Decisão

MongoDB como banco do `bunzina-workshop`, com as coleções `execution_queue` e
`execution_logs`, mais a `processed_events` com índice único em
`{ eventId, consumer }` para idempotência.

Hospedagem em **MongoDB Atlas, tier M0 gratuito**:

- O `bunzina-workshop` recebe a connection string por Secret no Kubernetes.
- Em desenvolvimento, um container `mongo` no `docker-compose.yml` mantém a paridade.
- Nenhum recurso de banco não relacional é provisionado no cluster.

## Motivo

- **Sobre o modelo de dados:** é o único serviço cujo dado é genuinamente
  semiestruturado. O checklist varia por tipo de serviço, e o registro do mecânico é
  anotação livre mais evidências. Modelar isso em tabela exigiria ou coluna `jsonb` — que
  é o documento com outro nome — ou uma tabela de atributos por tipo de serviço.
- **Sobre a hospedagem:** o M0 é gratuito sem prazo de expiração e tira do cluster um
  workload com estado, com PVC, backup e operação manual próprios. Isso libera cota do
  Learner Lab para o RabbitMQ, que precisa rodar dentro do cluster por paridade.
- A troca de PostgreSQL por Mongo é local à camada de infraestrutura: as interfaces de
  repositório vivem no domínio, conforme a [ADR 0002](./0002-clean-architecture.md).

## Consequências

- O `bunzina-workshop` passa a depender de rede externa: os nós do EKS precisam de saída
  para a internet e o IP de saída precisa estar na allowlist do Atlas. Recriar a
  infraestrutura pode trocar esse IP e derrubar o serviço até a allowlist ser atualizada.
- O M0 tem 512 MB de armazenamento e limites de conexão simultânea. É folgado para a
  demonstração e insuficiente para uso real — não é uma decisão de produção.
- A credencial do Atlas vira mais um segredo a gerenciar fora do Git, junto das
  credenciais do AWS Academy.
- A idempotência do Workshop usa índice único em coleção, não chave primária composta.
  A regra de gravar na mesma transação da escrita de negócio precisa de atenção
  redobrada, porque a garantia transacional do Mongo é diferente.
- A documentação de banco passa a ter dois modelos: o ER do PostgreSQL e o modelo de
  documentos do Mongo.

## Alternativas

- **MongoDB no cluster, espelhando o `bunzina-db`** — caminho conhecido, sem dependência
  externa e sem allowlist. Descartado porque adiciona um StatefulSet com PVC à cota do
  Learner Lab e traz backup e restauração manuais junto, sem nada em troca no que o PDF
  avalia.
- **DynamoDB gerenciado** — consome menos nós, mas o free tier é limitado e não tem
  paridade local sem emulador. Além disso, mudaria o modelo de acesso do serviço.
- **Coluna `jsonb` no PostgreSQL** — resolveria o dado, mas não atende ao requisito de
  banco não relacional e tornaria a justificativa técnica decorativa.
