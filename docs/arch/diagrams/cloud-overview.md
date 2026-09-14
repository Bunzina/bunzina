# Visão geral da nuvem

A arquitetura separa a entrada de login serverless do acesso às APIs de negócio.

![Visão geral da nuvem](../cloud-overview.png)

Fonte editável: [cloud-overview.svg](../cloud-overview.svg).

## Quem chama quem

| Origem | Destino | Fluxo |
| --- | --- | --- |
| Cliente | API Gateway HTTP API | `POST /auth/login` |
| API Gateway | Lambda Auth | Encaminha a requisição de login |
| Lambda | API principal via endereço configurado | Axios `POST /auth/login`, usando `BUNZINA_API_BASE_URL` |
| Cliente | ALB público | Rotas de negócio; Bearer JWT ou Api-Key quando exigido |
| ALB | Pods da API no EKS | Tráfego HTTP, com `target-type: ip` |
| API | PostgreSQL | Autenticação e persistência de negócio |
| GitHub Actions | Amazon ECR | Publicação de imagens e do chart OCI pelos respectivos workflows |
| GitHub Actions | Lambda / API Gateway / EKS | Deploy via Serverless e Helm |

A API concentra a autenticação e a geração de JWT; a Lambda valida a entrada e
repassa a resposta da API. A [sequência de autenticação](./sequence-auth.md)
detalha o fluxo do RFC e a divergência encontrada nos contratos locais.

## Rede, banco e artefatos

O Terraform em `infra/` declara VPC, subnets públicas e privadas, NAT, EKS,
node group, addons e ECR. O Ingress do chart configura o ALB público, que
encaminha o tráfego aos IPs dos pods. O NAT atende à saída das subnets privadas;
a [visão do EKS](./eks.md) detalha esse caminho.

O workflow `deploy-k8s.yml` usa banco externo quando `DB_HOST` está definido e
desativa o PostgreSQL do chart. Sem esse valor, usa o Service `postgres`,
StatefulSet e PVC. As duas conexões SQL tracejadas representam alternativas de
configuração, não replicação ou acesso simultâneo obrigatório aos dois bancos.
O destino externo é genérico; não há recurso RDS no Terraform local.

A Lambda é configurada no projeto irmão `bunzina-lambda/serverless.yml`, sem
associação VPC declarada. O caminho Lambda → ALB pressupõe que
`BUNZINA_API_BASE_URL` aponta para a API publicada nesse ALB. O desenho mostra a
topologia da solução; o valor do secret de deploy não foi consultado.

O painel de artefatos mostra a publicação no ECR. Imagens são consumidas pela
Lambda e pelos nós EKS; o chart OCI é consumido pelo Helm durante o deploy.

## Fontes e regeneração

- [VPC](../../../infra/vpc.tf) e [EKS](../../../infra/eks.tf).
- [Valores Helm](../../../charts/bunzina-chart/values.yaml).
- [Deploy da API](../../../.github/workflows/deploy-k8s.yml).
- Projeto irmão: `bunzina-lambda/serverless.yml`, serviço Axios e workflow de deploy.

Na raiz do projeto, em Linux/WSL com Python 3, librsvg, Cairo e GObject:

```sh
python3 -B docs/arch/diagrams/generate_auth_cloud.py
```
