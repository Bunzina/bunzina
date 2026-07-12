# Bunzina

API REST para gerenciamento de uma oficina mecânica, desenvolvida com **Bun**, **Elysia** e **PostgreSQL**, seguindo os princípios de **Clean Architecture**.

---

## Pré-requisitos

- [Bun](https://bun.sh) >= 1.3
- [Docker](https://www.docker.com) e Docker Compose

---

## Instalação

```bash
bun install
```

---

## Variáveis de ambiente

Copie o arquivo de exemplo e ajuste conforme necessário:

```bash
cp .env.prod.example .env
```

Para desenvolvimento local o valor padrão já funciona com o Docker Compose:

```
DATABASE_URL=postgres://bun:bun@localhost:5432/bunzina
APP_ENV=dev
JWT_SECRET=bunzina-jwt-secret
JWT_EXPIRES_IN=3600
EMAIL_SMTP_HOST=localhost
EMAIL_SMTP_PORT=1025
EMAIL_SMTP_USER=
EMAIL_SMTP_PASSWORD=
EMAIL=bunzina@local.com
```

| Variável | Descrição | Padrão |
| --- | --- | --- |
| `JWT_SECRET` | Chave secreta para assinar/verificar tokens JWT | `bunzina-jwt-secret` |
| `JWT_EXPIRES_IN` | Tempo de expiração do token em segundos | `3600` (1 hora) |
| `EMAIL_SMTP_HOST` | Host do servidor SMTP | `localhost` |
| `EMAIL_SMTP_PORT` | Porta do servidor SMTP local | `1025` |
| `EMAIL_SMTP_USER` | Usuário SMTP (quando necessário) | vazio |
| `EMAIL_SMTP_PASSWORD` | Senha SMTP (quando necessário) | vazio |
| `EMAIL` | Endereço remetente padrão das notificações | `bunzina@local.com` |

---

## Rodando o projeto

### Com Docker (recomendado)

Sobe a aplicação e o banco juntos, com hot reload:

```bash
bun dev
```

O Docker Compose também sobe o MailCatcher para testes locais de e-mail:

- SMTP local: `localhost:1025`
- UI web para visualizar e-mails enviados: `http://localhost:1080`

A API estará disponível em `http://localhost:3000`.  
Documentação Swagger em `http://localhost:3000/swagger`.

> Observação: ao executar `bun dev`, sobem a aplicação, o banco e as migrations automaticamente.

---

## Autenticação JWT

A API utiliza autenticação via **JSON Web Token (JWT)** com HMAC-SHA256 para proteger as rotas administrativas.

### Como funciona

1. O usuário faz login via `POST /auth/login` com email e senha
2. A API valida as credenciais e retorna um token JWT
3. O token deve ser enviado no header `Authorization` das requisições às rotas protegidas

> **Exceção:** o cadastro público de usuários com role `CUSTOMER` via `POST /users` não exige autenticação. Criar usuários com roles `ADMIN` ou `MECHANIC` requer um token válido.

### Exemplo de criação de usuário

O cadastro público de usuário aceita apenas a role `CUSTOMER`.

```bash
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"name":"Usuário Exemplo","email":"usuario@bunzina.com","password":"sua-senha","role":"CUSTOMER"}'
```

### Login

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@bunzina.com", "password": "sua-senha"}'
```

Resposta:

```json
{ "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." }
```

### Acessando rotas protegidas

```bash
curl http://localhost:3000/customers/12345678909 \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Pipeline de Terraform (infra/)

O workflow `.github/workflows/terraform.yml` roda o Terraform de `infra/`:

- **Plan** automático em PRs que tocam `infra/**`; o resultado é comentado no PR.
- **Apply** manual: aba **Actions → Terraform → Run workflow**. Requer aprovação
  no environment `production`.

**Secrets necessários** (Settings → Secrets and variables → Actions) — credenciais
temporárias do AWS Academy Learner Lab, **reatualize a cada reset do lab**:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`

O state fica em S3 (`bunzina-tfstate-<ACCOUNT_ID>`, key `infra/terraform.tfstate`),
com lock nativo do S3 (sem DynamoDB). O bucket é criado automaticamente no primeiro
run. Se a infra já foi aplicada localmente, rode `terraform state push` uma vez
antes do primeiro apply no CI.

---

## Deploy em Kubernetes (Fase 2)

A partir da Fase 2, a aplicação roda em **Kubernetes (AWS EKS)** em vez de AWS Lambda. A infraestrutura é provisionada com **Terraform** (`infra/`).

Os recursos Kubernetes da aplicação são gerenciados por meio de um **Helm Chart**, mantido em um repositório separado:

- [Bunzina Helm Chart](https://github.com/Bunzina/bunzina-chart)

Esse repositório contém os templates, values e configurações necessárias para realizar o deploy da aplicação no cluster Kubernetes. Portanto, para a avaliação e execução completa do projeto, devem ser considerados os dois repositórios:

- [Bunzina — aplicação principal](https://github.com/Bunzina/bunzina)
- [Bunzina Chart — Helm Chart para Kubernetes](https://github.com/Bunzina/bunzina-chart)

### Arquitetura

Os diagramas da Fase 2 estão em [docs/arch](docs/arch):

- [docs/arch/application-components.png](docs/arch/application-components.png) — componentes da aplicação (API, workers, DB e serviços externos)
- [docs/arch/infrastructure-provisioning.png](docs/arch/infrastructure-provisioning.png) — infraestrutura provisionada (cluster, banco, storage e secrets)
- [docs/arch/deploy.png](docs/arch/deploy.png) — fluxo de deploy (build, testes, push de imagem e deploy)



| Componente | Recurso |
| --- | --- |
| API | `Deployment` + `Service` + `Ingress` + `HPA` |
| Banco | `StatefulSet` Postgres com `PVC` (EBS gp3) |
| Config não-sensível | `ConfigMap` (`k8s/configmap.yaml`) |
| Segredos | `Secret` (a partir dos `*.example.yaml`, fora do git) |
| Infra | VPC + EKS + node group + ECR (`infra/`) |

### 1. Provisionar a infraestrutura (Terraform)

```bash
cd infra
cp terraform.tfvars.example terraform.tfvars   # ajuste se necessário
terraform init
terraform plan
terraform apply

# Configurar o kubectl para o cluster criado (use o output gerado):
aws eks update-kubeconfig --name bunzina-eks --region us-east-1
```

### 2. Criar os Secrets

Os arquivos `*.example.yaml` são modelos. Copie, preencha e aplique (os reais ficam no `.gitignore`):

```bash
cp k8s/secret.example.yaml k8s/secret.yaml
cp k8s/postgres-secret.example.yaml k8s/postgres-secret.yaml
# edite os dois (as credenciais de banco devem bater entre eles)

kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/postgres-secret.yaml
```

### 3. Aplicar os manifests

```bash
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/postgres-service.yaml
kubectl apply -f k8s/postgres-statefulset.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
kubectl apply -f k8s/hpa.yaml

kubectl get pods -n bunzina -w
```

### 4. Rodar as migrations

O banco é interno ao cluster, então abrimos um túnel e rodamos o engine de migrations (mesmo fluxo do CI/CD):

```bash
kubectl port-forward -n bunzina svc/postgres 5432:5432 &
APP_ENV=prod PROD_DATABASE_URL="postgres://<user>:<pass>@127.0.0.1:5432/bunzina" bun run migration
```

### 5. Acessar e validar

```bash
# Health via port-forward
kubectl port-forward -n bunzina svc/bunzina 8080:80
curl http://localhost:8080/health   # {"status":"ok"}

# Externamente (após o ALB provisionar):
kubectl get ingress -n bunzina
```

### Escalabilidade (HPA)

```bash
kubectl get hpa -n bunzina
# Gere carga e observe as réplicas subirem:
hey -z 60s -c 50 http://<endereco>/health
kubectl get pods -n bunzina -w
```

### Secrets necessários no GitHub Actions

| Secret | Uso |
| --- | --- |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` | Acesso ao ECR e ao EKS |
| `PROD_DATABASE_URL` | Banco usado pelos testes no job `test` |
| `DB_USER` / `DB_PASSWORD` | Credenciais do Postgres in-cluster para a migration |

### Cluster local (alternativa para demo)

Os manifests são genéricos. Em kind/minikube, remova `storageClassName: gp3` do `k8s/postgres-statefulset.yaml` (usa o StorageClass default) e troque o `Ingress` por um `Service` tipo `LoadBalancer` ou use `port-forward`.


---

## Endpoints

A documentação interativa completa (request/response schemas, exemplos e tags) fica em [`/swagger`](http://localhost:3000/swagger). A raiz `/` redireciona para lá.

### Rotas públicas

| Método | Rota          | Descrição                                  |
| ------ | ------------- | ------------------------------------------ |
| GET    | `/health`     | Healthcheck da API                         |
| POST   | `/auth/login` | Autenticação JWT                           |
| POST   | `/users`      | Cadastro público (apenas role `CUSTOMER`)  |
| GET    | `/service-orders/customer/:documentNumber` | Consulta de OS de um cliente pelo documento |


### Rotas protegidas (requerem JWT)

#### Customers

| Método | Rota                         | Descrição          |
| ------ | ---------------------------- | ------------------ |
| POST   | `/customers`                 | Criar novo cliente |
| GET    | `/customers/:documentNumber` | Buscar cliente     |
| PUT    | `/customers/:documentNumber` | Atualizar cliente  |
| DELETE | `/customers/:documentNumber` | Excluir cliente    |

#### Vehicles

| Método | Rota            | Descrição          |
| ------ | --------------- | ------------------ |
| POST   | `/vehicles`     | Criar novo veículo |
| GET    | `/vehicles`     | Listar veículos    |
| GET    | `/vehicles/:id` | Buscar veículo     |
| PUT    | `/vehicles/:id` | Atualizar veículo  |
| DELETE | `/vehicles/:id` | Excluir veículo    |

#### Users

| Método | Rota         | Descrição                                  |
| ------ | ------------ | ------------------------------------------ |
| GET    | `/users/:id` | Buscar usuário                             |
| PUT    | `/users/:id` | Atualizar usuário                          |
| DELETE | `/users/:id` | Excluir usuário                            |

#### Services

| Método | Rota            | Descrição          |
| ------ | --------------- | ------------------ |
| POST   | `/services`     | Criar serviço      |
| GET    | `/services/:id` | Buscar serviço     |
| PUT    | `/services/:id` | Atualizar serviço  |
| DELETE | `/services/:id` | Excluir serviço    |

#### Auto-Parts

| Método | Rota                              | Descrição                                |
| ------ | --------------------------------- | ---------------------------------------- |
| POST   | `/auto-parts`                     | Cadastrar peça                           |
| GET    | `/auto-parts`                     | Listar peças                             |
| GET    | `/auto-parts/:id`                 | Buscar peça                              |
| PUT    | `/auto-parts/:id`                 | Atualizar peça                           |
| DELETE | `/auto-parts/:id`                 | Excluir peça                             |
| GET    | `/auto-parts/:id/stock-movements` | Histórico de movimentações de estoque    |

#### Service Orders

| Método | Rota                                       | Descrição                          |
| ------ | ------------------------------------------ | ---------------------------------- |
| POST   | `/service-orders`                          | Criar ordem de serviço             |
| GET    | `/service-orders`                          | Listar ordens de serviço           |
| GET    | `/service-orders/:id`                      | Buscar ordem de serviço            |
| PUT    | `/service-orders/:id`                      | Atualizar ordem de serviço         |
| DELETE | `/service-orders/:id`                      | Excluir ordem de serviço           |
| PATCH  | `/service-orders/:id/status`               | Atualizar status da ordem          |
| PATCH  | `/service-orders/services/:id/complete`    | Marcar item de serviço como concluído |

#### Notifications

| Método | Rota             | Descrição          |
| ------ | ---------------- | ------------------ |
| POST   | `/notifications` | Enviar notificação |

## Visão geral da API

De forma geral, o fluxo de uso da API segue esta ordem:

1. Fazer o login em `POST /auth/login` e obter o token JWT.
2. Enviar o token no header `Authorization` para acessar as rotas protegidas.
3. Criar e manter os cadastros base, como usuários, clientes, veículos, serviços e autopeças.
4. Criar ordens de serviço e acompanhar seus itens, status e movimentações relacionadas. Para criar uma OS, é necessário ter um veículo, um cliente e ao menos um serviço já cadastrado.
5. Consultar os endpoints de apoio, como notificações e histórico de estoque, conforme a necessidade do fluxo.

As informações completas de request, response, exemplos e regras de cada rota estão no [Swagger](http://localhost:3000/swagger).