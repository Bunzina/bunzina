# bunzina-observability

Chart umbrella que sobe o stack de observabilidade do Bunzina no EKS: **Prometheus**,
**Grafana**, **node-exporter** e **kube-state-metrics** (via `kube-prometheus-stack`),
**Loki**, **Tempo** e **Alloy** (duas releases). Demo-grade: modo filesystem/single-binary
em tudo, sem S3, retenção curta, recursos enxutos — pensado para o cluster pequeno da
AWS Academy e para ser destruído depois da gravação do vídeo.

## Por que um chart separado do `bunzina-chart`

As CRDs do Prometheus Operator (`ServiceMonitor`, `PrometheusRule`, ...) precisam existir
**antes** do `ServiceMonitor` da aplicação ser aplicado. Misturar os dois num release só
criaria uma corrida e acoplaria o ciclo de vida do monitoring ao de cada deploy de código.
No pipeline (`deploy-k8s.yml`), o release deste chart roda **antes** do release `bunzina`.

## Dependências

| Chart | Papel | Modo |
| --- | --- | --- |
| `kube-prometheus-stack` (prometheus-community) | Prometheus + Grafana + node-exporter + kube-state-metrics | Alertmanager desligado — alertas ficam no Grafana unified alerting |
| `loki` (grafana) | Logs | `SingleBinary`, storage filesystem, PVC `gp3` |
| `tempo` (grafana-community) | Traces | Single binary, storage local, PVC `gp3` |
| `alloy` (grafana), alias `alloy-logs` | Coleta logs dos pods via API do Kubernetes (`loki.source.kubernetes`) → Loki | `Deployment`, sem hostPath/Docker socket |
| `alloy` (grafana), alias `alloy-gateway` | Recebe OTLP (gRPC 4317 / HTTP 4318) da aplicação → Tempo | `Deployment` |
| `mailcatcher` (manifest local, `templates/mailcatcher.yaml`) | Contact point de e-mail do Grafana unified alerting | `Deployment` + `Service`, sem persistência |

`alloy` aparece duas vezes porque `controller.type` (`deployment`/`daemonset`/`statefulset`)
é um valor por release — a coleta de logs e o gateway OTLP têm necessidades diferentes,
então cada um ganha seu próprio alias com `fullnameOverride` distinto.

## Nomes de serviço (DNS interno)

Todos os subcharts usam `fullnameOverride`, então os nomes ficam previsíveis dentro do
namespace `observability`:

- Prometheus: `obs-kube-prometheus-stack-prometheus:9090` (nome prefixado pela release do Helm)
- Grafana: `obs-grafana` (exposto também via Ingress ALB)
- Loki: `loki:3100`
- Tempo: `tempo:3200` (query) / `tempo:4317`, `tempo:4318` (OTLP direto, se algo quiser pular o Alloy)
- Alloy gateway (OTLP da app): `alloy-gateway:4317` / `alloy-gateway:4318`

A aplicação Bunzina aponta `OTEL_EXPORTER_OTLP_ENDPOINT` para
`http://alloy-gateway.observability.svc.cluster.local:4318`.

## Alertas e dashboards como código

Motor único: **Grafana unified alerting** (Alertmanager do kube-prometheus-stack fica
desligado). As regras, o contact point e a política de notificação estão em
`kube-prometheus-stack.grafana.alerting` (`values.yaml`) — mesmo conteúdo de
`observability/grafana/provisioning/alerting/*.yaml`, só trocando o host de SMTP pelo
`mailcatcher` desta release. O contact point de e-mail usa esse mailcatcher só para a
demo conseguir mostrar a notificação chegando — não é um servidor de e-mail real.

Os 5 dashboards (`observability/grafana/dashboards/*.json`) não são lidos diretamente
pelo chart — o Helm `.Files.Glob` não alcança fora do diretório do chart. O CI copia
esses arquivos para `charts/bunzina-observability/dashboards/` (gitignored, é um
artefato gerado, igual aos `.tgz` de dependência) antes do `helm upgrade`; o template
`templates/dashboards.yaml` transforma cada um num `ConfigMap` com o label
`grafana_dashboard: "1"`, que o sidecar do Grafana importa automaticamente.

## Como instalar

```bash
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add grafana-community https://grafana-community.github.io/helm-charts
helm dependency update charts/bunzina-observability

mkdir -p charts/bunzina-observability/dashboards
cp observability/grafana/dashboards/*.json charts/bunzina-observability/dashboards/

helm upgrade --install bunzina-observability charts/bunzina-observability \
  --namespace observability --create-namespace \
  -f charts/bunzina-observability/values.secret.yaml \
  --wait --timeout 10m
```

Precisa existir **antes** do release `bunzina` (as CRDs do Prometheus Operator e o
ServiceMonitor da app dependem disso).

## Validação

```bash
helm lint charts/bunzina-observability
helm template charts/bunzina-observability --namespace observability
```

Depois de instalado:

1. `kubectl get prometheus,servicemonitor -n observability` — confirmar que o
   ServiceMonitor do Bunzina (`bunzina`, em outro namespace) foi descoberto
   (`serviceMonitorSelector: {}` no Prometheus CR cobre todos os namespaces).
2. Grafana (via Ingress ALB) — datasources Prometheus/Loki/Tempo provisionados,
   dashboards de cluster (`grafana_dashboard: "1"`) já aparecem por padrão.
3. `kubectl logs -n observability deploy/alloy-logs` — sem erros de permissão ao
   descobrir pods.
4. Uma requisição à app com `OTEL_EXPORTER_OTLP_ENDPOINT` configurado deve gerar
   um trace visível no Tempo, acessível a partir de um log no Loki pelo `trace_id`.
5. Grafana → Alerting → Alert rules: as 4 regras da pasta `Bunzina` devem aparecer
   com `provenance: file`. Derrubar a app (`kubectl scale deploy/bunzina --replicas=0
   -n bunzina`) deve disparar `Bunzina target down` e chegar um e-mail no mailcatcher
   (`kubectl port-forward -n observability svc/mailcatcher 1080:1080`).

## O que fica de fora (demo-grade)

Alertmanager, cache (memcached) do Loki, Loki gateway/canary, ingress do Tempo,
persistência do Grafana (dashboards/datasources são as-code via sidecar de ConfigMap,
não criados manualmente na UI) e storage em S3 para Loki/Tempo — tudo desligado de
propósito para caber num cluster pequeno e não depender de IRSA (AWS Academy não
tem OIDC provider).
