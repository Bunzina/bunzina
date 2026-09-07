# ADR 0006 — Helm umbrella e chart genérico separado

- Status: Aceita
- Data: Fase 2

## Contexto

Manifests soltos em `/k8s` não escalam (imagem, secret, HPA, Postgres opcional). O PDF pede Dockerfile e deploy automatizado.

## Decisão

- Chart genérico `app-chart` no repositório [bunzina-chart](https://github.com/Bunzina/bunzina-chart), publicado em ECR OCI
- Umbrella `charts/bunzina-chart` neste repo, só com `values.yaml`
- Namespace **não** é criado pelo chart (`--create-namespace` no deploy)

## Motivo

- Values de ambiente ficam na aplicação; templates reutilizáveis ficam no chart
- `helm upgrade --install` é o contrato do CI
- Segredos fora do Git (`values.secret.yaml` gitignored)

## Consequências

- Deploy depende de `helm dependency update` contra o ECR
- Dois repositórios para um release
- O chart continua existindo além dos quatro repos exigidos na Fase 3

## Alternativas

- Manifests crus — simples, péssimo de parametrizar
- Kustomize — ok, o time já estava no Helm
