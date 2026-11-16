# Visão geral da arquitetura

O Bunzina é uma oficina mecânica em Bun e Elysia, recortada em quatro
microsserviços no EKS ([ADR 0012](./adrs/0012-microservices-split.md)). O login
continua com API Gateway e Lambda. A saga da OS é orquestrada pelo `bunzina-os`
([ADR 0013](./adrs/0013-orchestrated-saga.md)).

Diagrama geral: [diagrams/microservices.md](./diagrams/microservices.md).

## Componentes e responsabilidades

| Componente | Responsabilidade |
| --- | --- |
| API Gateway HTTP API | Expõe `POST /auth/login` e encaminha para a Lambda |
| Lambda Auth | Valida payload e CPF, chama o `bunzina` e repassa status e body |
| ALB | HTTP público de cadastros, OS e billing |
| `bunzina` | Cadastros, autenticação JWT/`Api-Key` e notificações |
| `bunzina-os` | Ciclo de vida da OS e orquestração da saga |
| `bunzina-billing` | Orçamento, aprovação e pagamento (Mercado Pago) |
| `bunzina-workshop` | Diagnóstico, fila e execução (ClusterIP, sem ALB) |
| PostgreSQL × 3 | Cadastros, OS/saga e billing — um banco por serviço |
| MongoDB Atlas | Fila e logs do workshop |
| RabbitMQ | Comandos `cmd.*` e eventos `evt.*` da saga |
| ECR | Imagens e chart OCI |
| Observabilidade | Prometheus, Loki, Tempo e Grafana |

## Fluxos

No login, o cliente envia `{ document, password }` para `POST /auth/login` no
API Gateway. A Lambda valida o CPF e chama a mesma rota na API principal via
Axios. A API busca o usuário pelo documento, verifica `is_active` e senha,
gera o JWT e devolve `{ token }`. A Lambda repassa essa resposta ao cliente.

Nas rotas protegidas, o cliente chama o ALB com `Authorization: Bearer <token>`.
O middleware da API valida o JWT; também há autenticação por `Api-Key` para
integrações. O Gateway não participa das rotas de negócio.

A criação de OS no `bunzina-os` valida cliente, veículo e itens via REST no
`bunzina`, persiste a ordem com snapshot e publica `cmd.workshop.start-diagnostic`.
O restante do ciclo (orçamento, pagamento, execução) segue a saga no RabbitMQ.

## Repositórios e deploy

| Repositório | Escopo |
| --- | --- |
| `bunzina` | Cadastros, auth, notifications, docs de arquitetura |
| `bunzina-os` | Ordem de serviço e orquestrador da saga |
| `bunzina-billing` | Orçamento e pagamento |
| `bunzina-workshop` | Diagnóstico e execução |
| `bunzina-broker` | RabbitMQ no EKS |
| `bunzina-lambda` | Lambda de login e API Gateway |
| `bunzina-infra` | Rede, cluster EKS, nós, addons e ECR |
| `bunzina-db` | PostgreSQL de cadastros no EKS |
| `bunzina-chart` | Chart genérico `app-chart`, publicado via OCI |

O banco é provisionado separadamente do chart da API, conforme a
[ADR-001](../adrs/adr-001-postgresql-terraform.md). O workflow da aplicação executa
testes, valida novas migrations, aplica as migrations pendentes quando há
arquivos novos, publica a imagem no ECR e atualiza os releases Helm.
A ordem de instalação está no [README principal](../../README.md#deploy-em-kubernetes).

## Camadas da aplicação

```text
src/
  domain/          entidades, value objects e interfaces
  application/     casos de uso
  adapters/        validação de entrada e apresentação das respostas
  api/             servidor Elysia, handlers e middleware
  infrastructure/  banco, JWT, notificações e observabilidade
```

Os casos de uso dependem das interfaces do domínio; a infraestrutura fornece
as implementações de persistência e serviços externos.

## Documentação relacionada

- [Diagrama dos microsserviços](./diagrams/microservices.md)
- [Diagramas](./diagrams/README.md)
- [Banco, migrations e relacionamentos](./database.md)
- [Saga orquestrada (ADR 0013)](./adrs/0013-orchestrated-saga.md)
- [Autenticação](./rfcs/0001-auth-cpf-lambda-gateway.md)
- [Observabilidade](../observability.md)
