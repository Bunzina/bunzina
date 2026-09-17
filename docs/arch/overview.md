# Visão geral da arquitetura

O Bunzina é uma API de gestão de oficina mecânica em Bun e Elysia, organizada
em Clean Architecture. A aplicação roda no EKS e persiste dados no PostgreSQL
no mesmo cluster. O login possui uma entrada serverless com API Gateway e Lambda.

## Componentes e responsabilidades

| Componente | Responsabilidade |
| --- | --- |
| API Gateway HTTP API | Expõe `POST /auth/login` e encaminha para a Lambda |
| Lambda Auth | Valida payload e CPF, chama a API e repassa status e body |
| ALB | Encaminha as requisições HTTP aos pods da API |
| API no EKS | Autenticação, JWT, cadastro, ordens de serviço e notificações |
| PostgreSQL no EKS | Persistência do schema `bunzina`, acessível pelo Service `postgres:5432` |
| ECR | Imagens da aplicação e da Lambda; chart OCI |
| Observabilidade | Métricas, logs e traces; dashboards e alertas no Grafana |

## Fluxos

No login, o cliente envia `{ document, password }` para `POST /auth/login` no
API Gateway. A Lambda valida o CPF e chama a mesma rota na API principal via
Axios. A API busca o usuário pelo documento, verifica `is_active` e senha,
gera o JWT e devolve `{ token }`. A Lambda repassa essa resposta ao cliente.

Nas rotas protegidas, o cliente chama o ALB com `Authorization: Bearer <token>`.
O middleware da API valida o JWT; também há autenticação por `Api-Key` para
integrações. O Gateway não participa das rotas de negócio.

A criação de OS verifica referências de cliente, veículo e itens, calcula o
orçamento e persiste cabeçalho e itens em uma transação, com status `RECEIVED`.
O e-mail de orçamento é enviado ao avançar para `AWAITING_APPROVAL`.

## Repositórios e deploy

| Repositório | Escopo |
| --- | --- |
| `bunzina` | API, migrations, umbrella Helm e CI/CD da aplicação |
| `bunzina-lambda` | Lambda de login e API Gateway |
| `bunzina-infra` | Rede, cluster EKS, nós, addons e ECR |
| `bunzina-db` | PostgreSQL no EKS e recursos de armazenamento e credenciais |
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

- [Diagramas](./diagrams/README.md)
- [Banco, migrations e relacionamentos](./database.md)
- [Autenticação](./rfcs/0001-auth-cpf-lambda-gateway.md)
- [Escalabilidade](./adrs/0008-scalability.md)
- [Observabilidade](../observability.md)
- [Histórico da decisão sobre o banco](./adrs/0011-managed-database.md)
