# Design — Chart Helm genérico (modelo subchart/umbrella)

Data: 2026-06-28

## Contexto

Hoje o chart vive em `bunzina-chart/charts/bunzina` e é **hardcoded** no app
"bunzina" — o `_helpers.tpl` retorna literais (`bunzina.name` → `"bunzina"`), e
cada template fixa nomes/labels do bunzina. Não dá para reaproveitar em outra
aplicação.

O objetivo é tornar o chart **genérico/reutilizável** e separar
responsabilidades entre os dois repositórios, mantendo o estilo didático dos
guias `docs/guia-eks-helm/`.

## Objetivos

- Chart compartilhado **genérico** (values-driven), reutilizável por apps futuros.
- O repo `bunzina` contém apenas um **umbrella** (`Chart.yaml` + `values.yaml`),
  **sem templates**.
- Templates **separados por recurso** (um `.yaml` por recurso) no chart
  compartilhado, para facilitar manutenção.
- Atualizar **todos** os guias (00–06); **implementar de fato até o guia 03**.

## Modelo escolhido: subchart / umbrella

Descartado o "library chart" (named templates via `include`), porque o requisito
"app só com values, sem templates" é incompatível com library (nada chamaria os
`include`). O modelo subchart/umbrella atende exatamente:

- **Chart compartilhado** = `type: application`, genérico, com templates `.yaml`
  normais que renderizam a partir de `.Values`.
- **Umbrella** = depende do chart compartilhado e só sobrescreve values.

## Estrutura dos repositórios

```
bunzina-chart/                         ← chart compartilhado, genérico
  charts/app-chart/
    Chart.yaml                         type: application, name: app-chart, version 0.1.0
    values.yaml                        defaults genéricos (app vazio/desligado por padrão)
    templates/
      _helpers.tpl                     helpers internos de nome/label (parametrizados)
      namespace.yaml                   lê .Values.namespace
      deployment.yaml                  lê .Values.app
      service.yaml                     lê .Values.app
      ingress.yaml                     if .Values.app.ingress.enabled
      hpa.yaml                         if .Values.app.autoscaling.enabled
      configmap.yaml                   lê .Values.app.config
      secret.yaml                      lê .Values.app.secret
      postgres-statefulset.yaml        if .Values.database.enabled  (lê .Values.database)
      postgres-service.yaml            if .Values.database.enabled  (headless)
      postgres-secret.yaml             if .Values.database.enabled
  README.md                            descreve o app-chart genérico

bunzina/                               ← umbrella (só values)
  charts/bunzina-chart/
    Chart.yaml                         name: bunzina-chart; dependencies: [app-chart]
    values.yaml                        configura o app-chart (aninhado)
    # SEM pasta templates/
```

## Chart compartilhado: `app-chart`

- `Chart.yaml`: `apiVersion: v2`, `name: app-chart`, `type: application`,
  `version: 0.1.0`, `appVersion: "1.0.0"`.
- **Genérico**: nomes e labels derivam de `.Values.app.name` e
  `.Values.database.name` — nenhum literal "bunzina" no chart.
- `_helpers.tpl` define helpers internos parametrizados por nome, ex.:
  - `app-chart.labels` (recebe um dict com `name`/`ctx`) → labels padrão k8s.
  - `app-chart.selectorLabels` → `app.kubernetes.io/name: <name>`.
- **Condicionais** para reuso: `app.ingress.enabled`, `app.autoscaling.enabled`,
  `database.enabled`. Um app sem banco roda com `database.enabled: false`.
- O `values.yaml` do `app-chart` traz defaults seguros (ex.: `database.enabled:
  false`, `app.ingress.enabled: false`), de modo que ele só faz algo quando o
  umbrella preenche os values.

### Recursos por template (espelham o chart atual, agora genéricos)

| Template | Renderiza | Origem dos values |
|---|---|---|
| `namespace.yaml` | Namespace | `.Values.namespace` |
| `deployment.yaml` | Deployment (probes /health, envFrom config+secret) | `.Values.app` |
| `service.yaml` | Service (ClusterIP) | `.Values.app.service` |
| `ingress.yaml` | Ingress (ALB) | `.Values.app.ingress` |
| `hpa.yaml` | HorizontalPodAutoscaler | `.Values.app.autoscaling` |
| `configmap.yaml` | ConfigMap (map de `config`) | `.Values.app.config` |
| `secret.yaml` | Secret (map de `secret`) | `.Values.app.secret` |
| `postgres-statefulset.yaml` | StatefulSet + volumeClaimTemplates (PVC) | `.Values.database` |
| `postgres-service.yaml` | Service headless (`clusterIP: None`) | `.Values.database` |
| `postgres-secret.yaml` | Secret do Postgres | `.Values.database.secret` |

## Umbrella: `bunzina-chart` (no repo `bunzina`)

- `charts/bunzina-chart/Chart.yaml`:
  ```yaml
  apiVersion: v2
  name: bunzina-chart
  type: application
  version: 0.1.0
  appVersion: "1.0.0"
  dependencies:
    - name: app-chart
      version: "0.1.0"
      repository: "file://../../../bunzina-chart/charts/app-chart"
  ```
- **Sem pasta `templates/`**.
- `values.yaml` aninha tudo sob o nome do subchart (`app-chart`):
  ```yaml
  app-chart:
    namespace: bunzina
    app:
      name: bunzina
      image: { repository: <ecr>/bunzina, tag: "", pullPolicy: IfNotPresent }
      replicaCount: 2
      containerPort: 3000
      service: { type: ClusterIP, port: 80 }
      ingress:
        enabled: true
        className: alb
        annotations:
          alb.ingress.kubernetes.io/scheme: internet-facing
          alb.ingress.kubernetes.io/target-type: ip
          alb.ingress.kubernetes.io/healthcheck-path: /health
          alb.ingress.kubernetes.io/listen-ports: '[{"HTTP": 80}]'
      autoscaling: { enabled: true, minReplicas: 2, maxReplicas: 10, targetCPU: 70 }
      resources: { requests: {cpu: 100m, memory: 128Mi}, limits: {cpu: 500m, memory: 256Mi} }
      probes: { path: /health }
      config: { APP_ENV: prod, PROD_DB_HOST: postgres, PROD_DB_PORT: "5432", PROD_DB_NAME: bunzina, ... }
      secret: { JWT_SECRET: change-me, PROD_DB_USER: bun, PROD_DB_PASSWORD: change-me, ... }
    database:
      enabled: true
      name: postgres
      image: postgres:15
      port: 5432
      persistence: { storage: 10Gi, storageClassName: gp3 }
      secret: { POSTGRES_USER: bun, POSTGRES_PASSWORD: change-me, POSTGRES_DB: bunzina }
      resources: { requests: {cpu: 100m, memory: 256Mi}, limits: {cpu: 500m, memory: 512Mi} }
  ```
- O subchart lê `.Values.namespace`, `.Values.app`, `.Values.database` (a chave
  `app-chart:` é removida quando o Helm repassa ao subchart).

## Mecanismo de dependência

- **Até o guia 03 (dev local):** `repository: file://../../../bunzina-chart/charts/app-chart`
  (relativo ao diretório do umbrella `bunzina/charts/bunzina-chart/`; sobe até
  `pos/` e entra no repo irmão).
  Fluxo: `helm dependency build` → `helm install bunzina charts/bunzina-chart -n bunzina --create-namespace`.
- **Guias 04+ (futuro, doc apenas):** publicar `app-chart` no ECR como OCI e
  trocar o `repository` para `oci://<conta>.dkr.ecr.us-east-1.amazonaws.com`.

## Mudanças nos guias (todos) e fronteira de implementação

| Guia | Mudança no doc | Implementação agora |
|---|---|---|
| 00 | Estrutura de pastas: `bunzina/charts/bunzina-chart` (umbrella) + `bunzina-chart/charts/app-chart` (genérico) | — |
| 01 | Apenas referências | — |
| 02 | Sem mudança relevante | — |
| 03 | **Reescrita**: criar `app-chart` genérico + umbrella `bunzina-chart`; `helm dependency build`; `helm install` local | ✅ sim |
| 04 | Publicar `app-chart` no ECR (OCI); umbrella aponta `oci://` | doc apenas |
| 05 | Atualizar referências de operação | doc apenas |
| 06 | CI/CD: `helm upgrade --install` do umbrella puxando `app-chart` via OCI | doc apenas |
| README do guia | Atualizar visão geral para o modelo subchart/umbrella | doc |
| README do `bunzina-chart` | Reescrever para descrever o `app-chart` genérico | doc + arquivo |

**Escopo implementado nesta entrega:**
1. Criar `bunzina-chart/charts/app-chart/` (Chart.yaml, values.yaml, `_helpers.tpl`,
   10 templates `.yaml` genéricos), substituindo o atual `charts/bunzina`.
2. Criar `bunzina/charts/bunzina-chart/` (Chart.yaml com dependency `file://` +
   values.yaml; sem templates).
3. Reescrever o guia 03 para o novo modelo.
4. Atualizar o **texto** de todos os guias 00–06 + READMEs.
5. Validar: `helm dependency build`, `helm lint`, `helm template` do umbrella.

## Fora de escopo (agora)

- `terraform apply` / provisionar EKS.
- Publicação real no ECR (OCI) e pipeline de CI/CD (guias 04–06) — só documentação.
- Deploy real no cluster.

## Validação de aceite

- `helm dependency build charts/bunzina-chart` resolve o `app-chart` via `file://`.
- `helm lint charts/bunzina-chart` passa.
- `helm template bunzina charts/bunzina-chart` renderiza os mesmos recursos do
  chart atual (Deployment, Service, Ingress, HPA, ConfigMap, Secret, StatefulSet,
  Service headless, Secret do Postgres, Namespace) — agora dirigidos por values.
- Nenhum literal "bunzina" no `app-chart` (genérico).
```
