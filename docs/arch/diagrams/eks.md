# Cluster EKS

O ALB público encaminha as requisições aos pods da API, que fazem a autenticação
e acessam o PostgreSQL no cluster. A entrada serverless de login está no
[diagrama de autenticação](./api-gateway-lambda.md).

![Cluster EKS](../eks.png)

Fonte editável: [eks.svg](../eks.svg).

## Rede e recursos

O Ingress usa classe `alb`, listener HTTP `80` e `target-type: ip`: o ALB alcança
os IPs dos pods diretamente. O backend lógico é o Service `bunzina:80`, com
porta de destino `3000`. O NAT atende à saída das subnets privadas.

| Recurso | Configuração |
| --- | --- |
| VPC / AZs | Padrão `10.0.0.0/16`, `us-east-1a` e `us-east-1b` |
| Node group | `t3.medium`, desejado 2, mínimo 1 e máximo 4 nós |
| Deployment da API | Imagem ECR; porta 3000; processo com usuário `bunzina` |
| HPA | 2–10 pods, alvo de CPU de 70% do request |
| Service | ClusterIP:80 → porta HTTP 3000 |
| Probes | Liveness `/health`; readiness `/ready` |
| ALB health check | `/health` |
| ConfigMap / Secret | Variáveis de ambiente injetadas por `envFrom` |
| Addons | VPC CNI, kube-proxy, CoreDNS e EBS CSI |
| Releases Helm em `infra/addons.tf` | AWS Load Balancer Controller e metrics-server |

O deploy usa `--create-namespace` e o umbrella referencia `app-chart` versão
`0.2.0` via OCI. Métricas, logs e traces são descritos na
[documentação de observabilidade](../../observability.md).

## PostgreSQL

O `bunzina-db` provisiona o banco separadamente, conforme a
[ADR-001](../../adrs/adr-001-postgresql-terraform.md): PostgreSQL 15 em Deployment
de uma réplica, Service `postgres:5432`, PVC `gp3` de 10 GiB e credenciais no
namespace `bunzina`. O chart da aplicação deve consumir esse banco existente; a [integração do deploy](../database.md#integração-com-o-chart-da-aplicação) ainda requer ajuste.

O workflow usa `postgres` como host padrão. `DB_HOST` permite sobrescrever o
endereço, inclusive com o DNS de um Service Kubernetes. As migrations no CI
usam port-forward quando essa variável está vazia.

## Fontes

- Repositório `bunzina-infra`: `infra/vpc.tf`, `infra/eks.tf` e `infra/addons.tf`.
- [Valores do umbrella](../../../charts/bunzina-chart/values.yaml)
- [Workflow de deploy](../../../.github/workflows/deploy-k8s.yml)
- [Decisão de provisionamento do banco](../../adrs/adr-001-postgresql-terraform.md)
