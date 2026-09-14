# ADR-001: Provisionamento do PostgreSQL no EKS com Terraform

- **Status:** Aceito
- **Data:** 2026-09-13
- **Decisores:** Equipe Bunzina

## Contexto

O Bunzina precisa de PostgreSQL 15 para desenvolvimento e execução no EKS. A
aplicação usa o banco `bunzina`, usuário `bun` e porta `5432`. As migrations
criam o schema `bunzina` e a tabela de controle das migrations.

O repositório `bunzina-infra` provisiona a VPC, o EKS, os nodes e o addon EBS
CSI. O `StorageClass` `gp3` e o PostgreSQL são provisionados pelo repositório
`bunzina-db`, depois que o cluster já existe. O PostgreSQL não deve ser criado
pelo chart da aplicação nem pelo repositório de infraestrutura geral.

## Decisão

Provisionar um PostgreSQL 15 dentro do EKS usando Terraform no repositório
`bunzina-db`. O módulo criará, no namespace `bunzina`:

- um secret no AWS Secrets Manager com usuário, senha e nome do banco;
- um `SecretProviderClass` que sincroniza os valores para Secrets Kubernetes;
- um PVC `ReadWriteOnce` usando o `StorageClass` `gp3`;
- um Deployment com uma réplica do `postgres:15`;
- um Service `ClusterIP` chamado `postgres` na porta `5432`.

O chart da aplicação deverá usar esse Service e não deverá criar um segundo
PostgreSQL. O `bunzina-db` lê o nome do cluster EKS pelo `terraform_remote_state`
do `bunzina-infra`; os dois repositórios mantêm states separados no mesmo
bucket S3, com keys distintas.

## Sizing inicial

O volume inicial será de 10 GiB, parametrizado por Terraform. A aplicação
possui até 10 pods e usa até 5 conexões por pod, mas esse limite não constitui
dimensionamento suficiente para CPU, memória, IOPS ou disponibilidade do
banco. O Deployment começa com uma réplica para preservar a semântica de
escrita única do PostgreSQL sobre um PVC `ReadWriteOnce`.

O tamanho do volume, recursos do pod e número de réplicas devem ser revisados
com métricas reais. Alta disponibilidade, replicação e backup externo ficam
fora desta decisão.

## Estrutura do `bunzina-db`

```text
bunzina-db/
├── infra/
│   ├── backend.tf
│   ├── versions.tf
│   ├── providers.tf
│   ├── variables.tf
│   ├── locals.tf
│   ├── remote-state.tf
│   ├── postgres.tf
│   ├── outputs.tf
│   └── terraform.tfvars.example
├── README.md
└── .gitignore
```

O módulo recebe o bucket e a key do state da infraestrutura, região, ambiente,
namespace, imagem, tamanho do volume e nome do banco. A autenticação do
provider Kubernetes usa o cluster EKS retornado pelo state remoto e as
credenciais AWS da execução.

## Rede e acesso

- O PostgreSQL não terá LoadBalancer nem endpoint público.
- O acesso ocorrerá pelo Service `postgres` dentro do namespace `bunzina`.
- A aplicação usará `PROD_DB_HOST=postgres`, `PROD_DB_PORT=5432` e
  `PROD_DB_NAME=bunzina`.
- Migrations continuam sendo executadas fora do Terraform, preferencialmente
  por um Job ou por `kubectl exec`/port-forward dentro do workflow.

## Estado e credenciais

O state do banco fica separado do state da infraestrutura:

```text
bunzina/infra/dev/terraform.tfstate
bunzina/db/dev/terraform.tfstate
```

O bucket S3 deve permanecer privado e versionado. A senha é fornecida pelo
GitHub Secret ao workflow ou por `TF_VAR_db_password` durante o apply e é
armazenada no Kubernetes Secret gerenciado pelo Terraform. O state também deve
ser tratado como dado sensível. Nenhum segredo deve ser versionado no Git.

## Consequências

### Positivas

- mantém o PostgreSQL isolado do chart da aplicação;
- usa o armazenamento EBS já suportado pelo EKS;
- permite aplicar ou destruir o banco sem alterar a VPC ou o cluster;
- reduz o acoplamento entre os repositórios;
- atende ao ambiente AWS Academy com uma arquitetura de baixo custo.

### Negativas e riscos

- Stateful workload no EKS exige operação manual de backup, restauração e
  atualização;
- uma única réplica não oferece alta disponibilidade;
- um volume EBS `ReadWriteOnce` fica associado a uma zona de disponibilidade;
- perda do PVC ou do volume pode causar perda de dados sem backup externo;
- o Terraform controla recursos Kubernetes, portanto o cluster precisa estar
  disponível antes do apply do `bunzina-db`.

## Alternativas consideradas

### Amazon RDS

Foi considerado inicialmente por oferecer um banco gerenciado. Foi descartado
para esta fase porque o ambiente já utiliza PostgreSQL no EKS e o objetivo é
manter a arquitetura atual, evitando duplicar o banco e os custos de RDS.

### PostgreSQL criado pelo chart da aplicação

Foi descartado porque mistura o ciclo de vida do banco com o deploy da API.
O banco agora pertence ao `bunzina-db`, enquanto o chart da aplicação apenas
consome o Service existente.

### StatefulSet com operador PostgreSQL

Fica como evolução futura caso sejam necessários failover, backups,
replicação e upgrades automatizados. Nesta fase, o Deployment de uma réplica
mantém a implementação pequena e compatível com o ambiente de estudos.

## Critérios de validação

- aplicar primeiro o `bunzina-infra` e atualizar seu state remoto;
- executar `terraform validate` e `terraform plan` no `bunzina-db`;
- confirmar a criação do PVC, Deployment, Service e Secret;
- verificar `kubectl get pods,pvc,svc -n bunzina`;
- executar migrations por um caminho com acesso à rede do cluster;
- confirmar que o chart da aplicação está com o banco embutido desabilitado.

## Fora de escopo

- RDS, Multi-AZ e read replicas;
- backup externo e estratégia de disaster recovery;
- execução automática das migrations pelo Terraform;
- criação de pipeline de deploy entre os repositórios;
- observabilidade avançada e failover automatizado.