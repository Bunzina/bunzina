# 📋 Tasks — Fase 2 (14SOAT)

Checklist de implementação para evoluir o projeto da Fase 1 à Fase 2.

## Progresso da migração para Kubernetes (feito até agora)

Resumo do que já está **pronto e validado** (deploy real em EKS confirmado):

- **Infra com Terraform** (`infra/`): VPC, EKS, node group, addons (vpc-cni,
  kube-proxy, coredns, EBS CSI), ECR (imagem `bunzina` + chart `app-chart`),
  StorageClass `gp3`. Cluster provisionado e `terraform apply` bem-sucedido.
  - Inclui launch template com **IMDS hop-limit 2** (sem isso o EBS CSI /
    ALB controller entram em CrashLoop no Learner Lab).
- **Helm em vez de manifests crus**: em vez dos `.yaml` soltos em `/k8s`, o app
  virou um **chart genérico reutilizável** (`app-chart`, no repo `bunzina-chart`)
  consumido por um **umbrella** (`bunzina-chart`, em `charts/bunzina-chart` deste
  repo, só `values.yaml`). Padrão subchart/umbrella.
- **Deploy validado ao vivo**: `helm install` → 2 pods do app + Postgres
  (StatefulSet + PVC EBS gp3) Running, Service, Ingress com **ALB** servindo
  `/health` (200), e **HPA** escalando por CPU (metrics-server instalado).
- **Segredos fora do git**: `app.secret`/`database.secret` em
  `values.secret.yaml` (gitignored), com `values.secret.example.yaml` versionado.
- **Guia completo** em `docs/guia-eks-helm/` (partes 00–06: pré-requisitos,
  Terraform, imagem ECR, chart, publicação OCI, operar, CI/CD).
- **Segurança (hardening de auth)**: removidos os segredos hardcoded
  (`JWT_SECRET` e `API_KEY` agora obrigatórios via env, sem default), comparação
  de API key em tempo constante, e service principal explícito quando a auth é
  via `Api-Key` (evita bypass silencioso de checagens por usuário).

## Prioridade: Alta
- [ ] Ajustar listagem de Ordens de Serviço: ordenar por status (Em Execução > Aguardando Aprovação > Diagnóstico > Recebida) e, dentro do mesmo status, mais antigas primeiro. Excluir logicamente OS com status `COMPLETED` ou `DELIVERED` da listagem pública.
  - Arquivos relacionados: `src/infrastructure/repositories/service-order/service-order-repository.ts`, `src/application/use-cases/service-order/list.ts`, `src/adapters/input/service-order/list.ts`.
- [x] Implementar endpoint de abertura de Ordem de Serviço que receba cliente, veículo, serviços e peças em uma única requisição (FEITO NA FASE 1).
  - A OS deve nascer com status inicial `RECEIVED`.
  - Ponto de atenção: a API de abertura já existe e hoje recebe os IDs de referência das entidades; se isso já atender ao que foi pedido, não precisa modificar nada nesse ponto.
- [x] Implementar endpoint público seguro para receber aprovações externas (webhook) e atualizar o `approvedAt` / status da OS.
  - Ponto de partida: `src/api/handlers/service-order/update.ts` e `src/api/handlers/service-order/schema.ts`.
  - Nota: já existe `src/adapters/input/service-order/validate-quote-confirmation.ts` (FEITO NA FASE 1).
- [x] Garantir que a documentação da API permita validar rapidamente os endpoints novos e alterados durante a avaliação.
  - Informar no README como acessar o Swagger localmente e onde está a collection completa das APIs.

## Prioridade: Média
- [ ] Implementar processamento de inbound email para atualizar status (se exigido). Alternativa: usar um serviço que converta email em webhook.
  - Arquivos/áreas: infra / integração com provider (ex.: Mailgun, SendGrid) ou criar worker que conecta IMAP.
- [x] ~~Criar manifestos Kubernetes mínimos em `/k8s`~~ → **substituído por Helm**: o app é empacotado num chart genérico (`app-chart`) + umbrella (`charts/bunzina-chart`), com Deployment, Service, Ingress (ALB), HPA, ConfigMap, Secret e Postgres (StatefulSet + PVC). Ver [docs/guia-eks-helm/03](guia-eks-helm/03-helm-chart.md).
- [x] Adicionar scripts Terraform em `/infra` para provisionar cluster e banco de dados; documentar recursos criados. (VPC + EKS + node group + addons + ECR + StorageClass; documentado nas partes [00](guia-eks-helm/00-pre-requisitos.md)/[01](guia-eks-helm/01-infra-terraform.md).)
- [x] Disponibilizar os diagramas de arquitetura no repositório, preferencialmente em `docs/arch/` como PNG.
  - Pode ser um diagrama único ou vários diagramas por contexto.
  - Parcial: há Domain Storytelling em `docs/domain-storytelling/*.egn` e um diagrama ASCII de arquitetura no README (seção "Deploy em Kubernetes"). Falta o PNG em `docs/arch/`.

## Prioridade: Baixa / Finalização
- [ ] Adaptar pipeline CI/CD (GitHub Actions) para: build → testes → build imagem → push → deploy em Kubernetes.
  - Estado: `.github/workflows/deploy-k8s.yml` existe (jobs de test/migração/build/push OK, região corrigida para `us-east-1`), mas o job `deploy` **ainda usa `kubectl apply -f k8s/*`** (pasta removida na migração). Falta trocar por `helm upgrade --install` puxando o `app-chart` do OCI — passo a passo documentado na [Parte 06](guia-eks-helm/06-cicd-bunzina.md). Requer publicar o `app-chart` no ECR ([Parte 04](guia-eks-helm/04-publicar-chart.md)).
- [ ] Atualizar `README.md` com arquitetura da fase 2, instruções de deploy local/K8s e uso dos scripts Terraform.
  - Parcial: o README tem a seção "Deploy em Kubernetes" (com diagrama e passos), mas ainda descreve o fluxo antigo `kubectl apply -f k8s/`; atualizar para o fluxo Helm (umbrella + `helm install`).
- [ ] Validar e aumentar cobertura de testes nas áreas alteradas (listagem, webhook, email). Garantir cobertura ≥ 80% nos domínios críticos.
- [ ] Produzir vídeo demonstrativo de no máximo 15 minutos mostrando deploy, CI/CD, consumo das APIs principais e escalabilidade.
  - O vídeo deve mostrar deploy, execução do CI/CD, consumo das APIs principais e escalabilidade automática com HPA; na parte de deploy e de CI/CD, pode ser mostrada uma execução bem-sucedida com explicação rápida das etapas.
  - Se sobrar tempo, incluir arquitetura, Clean Architecture/Hexagonal, testes, Terraform e observabilidade.
- [ ] Criar PDF final de entrega.

## Prioridade: Muito Baixa
Esses itens são melhorias em relação à fase 1, baseadas no feedback do professor, e só entram se houver tempo para refinamento.
- [x] Evoluir o Dockerfile para multi-stage. (base → deps → runner.)
- [x] Rodar a aplicação com usuário não root. (`USER bunzina`.)
- [x] Adicionar um `.dockerignore`.
- [ ] Aprofundar o relatório de vulnerabilidades, mostrando as findings analisadas e não apenas o link.
  - Já corrigidas nesta rodada (documentar no relatório): segredos hardcoded (`JWT_SECRET`/`API_KEY`), comparação de API key não constant-time, e auth via `Api-Key` sem contexto de usuário. Ver `src/infrastructure/services/{jwt,api-key}.ts` e `src/api/middleware/auth.ts`.
- [x] Verificar se o Domain Storytelling já está devidamente adicionado; se já estiver, considerar esse ponto fechado. (`docs/domain-storytelling/*.egn`.)

## Notas
- Os pontos levantados na apresentação reforçam que a entrega precisa deixar claro onde estão os diagramas, como executar a aplicação e como testar as APIs sem depender só da collection.
- Conferir se nossa abordagem de Clean Architecture está bem purista, já que o professor frisou que precisa ser uma abordagem bem acadêmica.
- **Pegadinhas do Learner Lab já resolvidas** (documentadas no guia): região só `us-east-1`; `LabRole`/`voclabs` em vez de IAM próprio; sem IRSA (ALB controller e EBS CSI usam a role do nó); IMDS hop-limit 2 obrigatório; o chart **não** cria o Namespace (usar `--create-namespace`).

## README — conteúdo obrigatório / README — required content

Português:
- [x] Passo a passo para executar a API localmente (`bun install`, `docker compose up` ou `bun --hot run src/api/server.ts`), como configurar variáveis de ambiente e executar migrations (`bun run migration`).
- [x] Passo a passo de uso da API com exemplos (`curl`) e link/arquivo da collection (Postman/Insomnia).
- [x] Desenho da arquitetura com:
- [x] Link ou instruções para acessar a documentação Swagger/OpenAPI localmente (ex.: `http://localhost:3000/docs` ou `http://localhost:3000/swagger`).
  - Componentes da aplicação (API, workers, DB, serviços externos).
  - Infraestrutura provisionada (K8s cluster, DB, storage, secrets management).
  - Fluxo de deploy (build → tests → image push → apply manifests / terraform apply).
- [x] Seção indicando onde ficam os diagramas, por exemplo: `docs/arch`.
