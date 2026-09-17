# RFC 0002 — Separação de repositórios

- Status: Aceita
- ADR: [0009](../adrs/0009-four-repositories.md)

## Organização

| Repositório | Conteúdo |
| --- | --- |
| `bunzina` | Aplicação, migrations, umbrella Helm e CI/CD |
| `bunzina-lambda` | Function de login e API Gateway |
| `bunzina-infra` | Terraform de rede, EKS, nós, addons e ECR |
| `bunzina-db` | Terraform do PostgreSQL no EKS |
| `bunzina-chart` | Chart genérico publicado via OCI |

A aplicação consome o cluster por kubeconfig e Helm. As migrations continuam
no repositório `bunzina`, enquanto o banco possui provisionamento e state
separados. O `bunzina-db` obtém o nome do cluster pelo remote state do
`bunzina-infra` em S3.

## Instalação e atualização

1. Provisionar a infraestrutura de rede e EKS.
2. Provisionar o PostgreSQL pelo `bunzina-db`.
3. Publicar o chart e executar o deploy da aplicação.
4. Publicar a imagem da Lambda e executar o deploy Serverless com o endereço da API.

Os detalhes operacionais estão no [README principal](../../../README.md#deploy-em-kubernetes).
Para o banco, seguir a [ADR-001](../../adrs/adr-001-postgresql-terraform.md).
As keys de state devem ser distintas mesmo quando compartilham um bucket S3.

## Alternativas consideradas

Manter as migrations no repositório do banco separaria o schema do código que
consome suas alterações. Incorporar o Gateway ao repositório do cluster
separaria componentes de login que são implantados juntos pelo Serverless.
