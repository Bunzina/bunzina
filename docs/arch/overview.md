# Visão geral da arquitetura

O Bunzina é a API REST de uma oficina mecânica. A aplicação segue Clean Architecture (domínio sem dependência de frameworks), roda em **Bun + Elysia** e persiste dados em **PostgreSQL**. A solução de nuvem usa AWS API Gateway, Lambda, EKS, PostgreSQL no cluster, ECR, Secrets Manager e Terraform.

O banco adotado é PostgreSQL no EKS, conforme a [ADR-001](../adrs/adr-001-postgresql-terraform.md). Os diagramas detalhados estão em [diagrams/](./diagrams/README.md).

---

## Estado atual (Fases 1 e 2)

O tráfego das APIs de negócio chega ao EKS por meio do API Gateway e do balanceador ALB. O login é exposto por uma rota serverless. A API mantém autenticação e autorização próprias como segunda camada de proteção.

![Infraestrutura atual](./infrastructure-provisioning.png)

### Componentes atuais

| Componente | Onde vive | Função |
| --- | --- | --- |
| API Elysia | Deployment no EKS | CRUD, workflow de OS, JWT e autorização |
| PostgreSQL | PostgreSQL 15 no EKS; PostgreSQL do Compose no desenvolvimento | Persistência relacional no schema `bunzina` |
| Helm umbrella | `charts/bunzina-chart` + [bunzina-chart](https://github.com/Bunzina/bunzina-chart) | Recursos da API; consome o Service PostgreSQL provisionado separadamente |
| Terraform Kubernetes | `bunzina-infra` | VPC, EKS, node group, addons e ECR |
| Terraform banco | `bunzina-db` | PostgreSQL no EKS: Deployment, Service, PVC, StorageClass e credenciais |
| CI/CD aplicação | `.github/workflows/deploy-k8s.yml` | Testes, migrations, build, push ECR, `helm upgrade` |
| CI/CD infraestrutura | Workflows Terraform | `plan` em Pull Request e `apply` controlado em produção |
| Lambda de autenticação | `bunzina-lambda` | Entrada serverless para o login e integração com a API |
| Notificação | Nodemailer | E-mail de orçamento ao avançar para `AWAITING_APPROVAL` |

### Autenticação atual

- Login: `POST /auth/login` com **e-mail e senha**
- JWT HS256 emitido pela própria API (`sub`, `email`, `role`, `iat`, `exp`)
- Rotas protegidas validam `Authorization: Bearer` ou `Api-Key` no middleware
- CPF/CNPJ existe no cadastro de **cliente**, não no de **usuário**
- Cadastro público: `POST /users` apenas com role `CUSTOMER`

### Repositórios

1. [bunzina](https://github.com/Bunzina/bunzina) — aplicação, migrations, Terraform do EKS
2. [bunzina-chart](https://github.com/Bunzina/bunzina-chart) — Helm Chart genérico (`app-chart`)
3. `bunzina-lambda` — Function de autenticação e API Gateway
4. `bunzina-infra` — infraestrutura de rede e Kubernetes
5. `bunzina-db` — provisionamento do PostgreSQL no EKS

---

## Fluxo alvo

A entrada pública da solução é o API Gateway. O Gateway encaminha o login para a Lambda e as APIs de negócio para o ALB/EKS. O PostgreSQL roda no EKS e a API o acessa pelo Service interno `postgres:5432`. A Lambda acessa a API, não o banco diretamente.

![Arquitetura AWS Fase 3](./cloud-overview.png)

| Mudança | Motivo |
| --- | --- |
| API Gateway na frente de tudo | Roteamento, validação de JWT e políticas antes dos serviços internos |
| Lambda de autenticação | Validar CPF, consultar cliente/status e emitir JWT numa única Function |
| PostgreSQL no EKS | Banco provisionado separadamente pelo `bunzina-db`, conforme a ADR-001 |
| Repositórios separados | Separar Lambda, infra K8s, infra de banco e aplicação, cada um com CI/CD |

O desenho detalhado está nas RFCs [0001](./rfcs/0001-auth-cpf-lambda-gateway.md), [0002](./rfcs/0002-repository-split.md) e [0003](./rfcs/0003-managed-database.md).

### Fluxo de autenticação

1. O cliente envia CPF, e-mail e senha ao endpoint público de autenticação.
2. O API Gateway encaminha a requisição para a Lambda.
3. A Function normaliza e valida o CPF, consulta o usuário e o cliente e verifica o status da conta.
4. A Function emite o JWT e o devolve ao cliente.
5. O cliente envia o JWT nas chamadas protegidas.
6. O Gateway valida o token antes de encaminhar a chamada ao ALB/EKS.
7. A API valida novamente o token e aplica as permissões específicas do papel.

Na implementação atual, a Lambda ainda delega o login para `POST /auth/login` da
API principal. O fluxo acima é o contrato arquitetural da autenticação completa.

### Fluxo de dados e deploy

- A aplicação é empacotada em imagem e publicada no ECR.
- O chart Helm configura Deployment, Service, Ingress/ALB, HPA, probes, secrets e métricas.
- O pipeline aplica migrations pendentes antes do rollout da aplicação.
- O PostgreSQL é provisionado no EKS pelo `bunzina-db`, com Service interno, Deployment e PVC, conforme a [ADR-001](../adrs/adr-001-postgresql-terraform.md).
- O Terraform de infraestrutura cria a VPC, subnets, EKS, node group, addons, ECR e StorageClass.
- O chart da API deve consumir o PostgreSQL existente, sem criar outra instância. `DB_HOST` configura o endereço do Service Kubernetes.

---

## Camadas da aplicação

```
src/
  domain/            entidades, VOs, interfaces — sem dependência externa
  application/       casos de uso
  adapters/          input (HTTP → use case) e output (presenter)
  api/               Elysia, handlers, middleware JWT
  infrastructure/    repositórios bun:sql, JWT, e-mail, Postgres
```

Fluxo de dependência: `api` → `adapters` → `application` → `domain` ← `infrastructure`.

---

## Escalabilidade em vigor

| Recurso | Valor | Justificativa |
| --- | --- | --- |
| Node group EKS | `t3.medium`, min 1 / desired 2 / max 4 | Cabe no AWS Academy Learner Lab e aguenta HPA + Postgres |
| Réplicas da API | min 2 / max 10 | Evita SPOF e cobre pico de correção/demo |
| HPA | CPU 70% | Escala antes de saturar o limite de 500m |
| Requests/limits | 100m–500m CPU, 128–256Mi | Cabe em 2 nós `t3.medium` com folga para kube-system |
| IMDS hop-limit | 2 | Sem isso, EBS CSI e ALB controller entram em CrashLoop no Learner Lab |
| NAT | 1 gateway | Custo; duas AZs apenas para o ALB |

Detalhes em [ADR 0008](./adrs/0008-scalability.md).
