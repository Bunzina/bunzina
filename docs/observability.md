# Observabilidade

## Estado atual

A API Bunzina expõe métricas Prometheus em `GET /metrics` e possui duas probes:

- `GET /health`: liveness, sem dependências externas.
- `GET /ready`: readiness, executa uma consulta simples no PostgreSQL.

Cada requisição recebe um `requestId` do logger estruturado. O ID é criado pelo
logger e deve ser usado para localizar todos os eventos daquela requisição nos
logs. A API não precisa expor esse ID na resposta para manter a compatibilidade
do contrato HTTP atual.

O endpoint `/metrics` não usa JWT. Em produção, ele deve ser acessível somente pela rede do Prometheus, por uma NetworkPolicy ou por uma regra interna do ingress. Não o exponha pelo ALB público sem uma proteção adicional.

## Stack local

O `docker-compose.yml` "de trabalho" não inclui observabilidade — só app, banco e
mailcatcher. Para subir Prometheus, Loki, Tempo, Alloy e Grafana junto, use o overlay:

```sh
bun run dev:observability
# equivalente a:
docker compose -f docker-compose.yml -f docker-compose.observability.yml up --build
```

Endereços locais:

- API: `http://localhost:3000`
- Métricas: `http://localhost:3000/metrics`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

O usuário e a senha padrão do Grafana são `admin`/`admin`. Para alterar a senha local:

```sh
GRAFANA_ADMIN_USER=admin GRAFANA_ADMIN_PASSWORD=change-me docker compose -f docker-compose.yml -f docker-compose.observability.yml up
```

O Prometheus faz scrape de `app:3000/metrics`. O Alloy coleta os logs dos containers pelo Docker socket e envia os eventos JSON para o Loki, e também recebe OTLP da app (gRPC 4317 / HTTP 4318) e encaminha para o Tempo. Os datasources e dashboards do Grafana são provisionados automaticamente a partir de `observability/`.

Endereços adicionais:

- Loki: `http://localhost:3100`
- Tempo: `http://localhost:3200` (a porta não é publicada no host; acesse via Grafana)
- Mailcatcher (contact point dos alertas): `http://localhost:1080`
- Dashboard de logs: pasta `Bunzina`, dashboard `Bunzina Logs`

O acesso ao Docker socket é adequado somente para desenvolvimento local. Em Kubernetes, use a integração do Alloy com os logs dos pods e restrinja as permissões do agente.

## Logs no Grafana

O logger atual já emite JSON para stdout. O pipeline local é:

```text
Bunzina -> stdout JSON -> Alloy -> Loki -> Grafana
```

Labels persistentes no Loki são limitados a `compose_service`, `container`, `job` e `service_name`. Campos como `requestId`, `level`, `service`, `http_method` e `http_url` são extraídos do JSON para consulta, mas não viram labels de stream.

Consultas úteis no Explore do Grafana:

```logql
{compose_service="app"} | json
```

```logql
{compose_service="app"} | json | level="ERROR"
```

```logql
{compose_service="app"} | json | service="bunzina" | http_method="POST"
```

```logql
{compose_service="app"} | json | requestId="<request-id>"
```

O logger atual registra a URL HTTP original. Não use IDs, documentos ou query strings como labels Loki; para agregação por API, o próximo refinamento é registrar uma rota normalizada como campo estruturado de conclusão da requisição.

## Tracing

A aplicação expõe tracing distribuído via OpenTelemetry (`src/infrastructure/observability/tracing.ts`), usando o plugin `@elysiajs/opentelemetry`. No Bun, a auto-instrumentação de HTTP do Node não funciona (o runtime não usa o módulo `http`), então os spans vêm do ciclo de vida do Elysia, não de instrumentação automática — e não há span de query, já que o banco usa `Bun.SQL`, que também não é auto-instrumentado.

O SDK só inicializa se `OTEL_EXPORTER_OTLP_ENDPOINT` estiver definido. Sem essa env var (testes, `start:dev` sem a stack), nada é carregado. As rotas `/metrics`, `/health` e `/ready` nunca geram trace.

Requisições que já chegam com `traceparent` (W3C Trace Context) são respeitadas — o span da requisição nasce como filho do trace de origem. O `requestId` do logger estruturado (`src/infrastructure/observability/logger-trace.ts`) adota o `trace_id` do span ativo quando existe um, então o log casa com o trace no Tempo sem precisar de um segundo identificador.

## Métricas HTTP

As métricas são mantidas em `src/infrastructure/observability/metrics.ts`, que encapsula o `prom-client` e seu `Registry`:

- `bunzina_http_requests_total`: contador por `method`, `route` e `status_code`.
- `bunzina_http_request_duration_seconds`: histograma por `method`, `route` e `status_code`.
- `bunzina_http_requests_in_flight`: requisições em processamento.
- `bunzina_authentication_attempts_total`: tentativas de login por resultado (`success` ou `failure`).
- `bunzina_notifications_total`: notificações processadas por canal e resultado.
- `bunzina_stock_movements_total`: movimentações criadas por tipo (`IN` ou `OUT`).
- `bunzina_service_orders_total`: eventos de ordem de serviço por evento e status.
- `bunzina_service_order_status_duration_seconds`: histograma do tempo que uma ordem de serviço passou em `from_status` antes de mover para `to_status`, calculado em `update-status.ts` a partir do `updatedAt` anterior.

Também são coletadas métricas padrão do processo Node/Bun pelo cliente Prometheus.

As rotas dinâmicas são normalizadas para evitar cardinalidade alta. Documentos, IDs, query strings, tokens, e-mails e payloads nunca devem ser adicionados como labels.

## Dashboards

Em `observability/grafana/dashboards/`:

- `bunzina-api.json` — tráfego, latência P95, requisições em voo, autenticação, notificações e eventos de ordens de serviço.
- `bunzina-logs.json` — logs.
- `bunzina-service-orders-volume.json` — volume diário de ordens de serviço criadas, por status inicial.
- `bunzina-service-order-duration.json` — tempo médio de execução por status (`bunzina_service_order_status_duration_seconds`), incluindo o exemplo do task doc (`IN_EXECUTION -> COMPLETED`).
- `bunzina-integration-errors.json` — misto Prometheus (falha de notificação por canal, taxa de 5xx por rota) + Loki (linhas de log de erro reais, com `trace_id` clicável para o Tempo).

No Kubernetes esses mesmos arquivos viram `ConfigMap`s (ver `charts/bunzina-observability/templates/dashboards.yaml`) — não são duplicados, só copiados pelo CI antes do `helm upgrade`.

## Alertas

Motor único: **Grafana unified alerting**. O Prometheus não tem mais `rule_files` nem roda seu próprio Alertmanager — ele só guarda séries para o Grafana consultar. As regras, o contact point (e-mail via mailcatcher) e a política de notificação são provisionados como código em `observability/grafana/provisioning/alerting/` (local) e em `kube-prometheus-stack.grafana.alerting` / `grafana.ini.smtp` (`charts/bunzina-observability/values.yaml`, Kubernetes) — mesmo conteúdo, só o host de SMTP muda entre os dois ambientes.

As 4 regras, na pasta `Bunzina`:

- `BunzinaTargetDown` — `up{job="bunzina"} < 1` por 5 minutos, crítico.
- `BunzinaHighServerErrorRate` — mais de 5% de respostas 5xx por 10 minutos, warning.
- `BunzinaHighRequestLatency` — P95 acima de 1s por 10 minutos, warning.
- `BunzinaServiceOrderFailures` — qualquer 5xx nas rotas `/service-orders*` por 5 minutos, warning. Cobre "falhas no processamento de ordens de serviço" (task doc) derivando da métrica HTTP já existente por rota, em vez de um contador dedicado: todo erro inesperado num use case de ordem de serviço já propaga como 5xx numa rota normalizada (`/service-orders/:id/status`, etc.), então o sinal já existe em `bunzina_http_requests_total` sem precisar de um ponto de instrumentação novo. Se um caso real aparecer que não vire 5xx (um efeito colateral silenciosamente engolido, por exemplo), vale revisitar essa decisão e adicionar um contador próprio.

Os limiares são valores iniciais e devem ser ajustados conforme o tráfego real. Provisionamento por arquivo (`provenance: file` na API do Grafana) significa que essas regras **não são editáveis pela UI** — mudanças entram por PR.

## Kubernetes

O chart local é um umbrella chart e delega os templates ao `app-chart` (repositório `Bunzina/bunzina-chart`, distribuído via OCI). A partir da versão `0.2.0`, o chart suporta porta de métricas no Service, `ServiceMonitor` opcional e probes de liveness/readiness separadas — os valores em `charts/bunzina-chart/values.yaml` já usam esse contrato:

```yaml
app:
  probes:
    path: /health
    livenessPath: /health
    readinessPath: /ready
  metrics:
    enabled: true
    path: /metrics
    port: 3000
    serviceMonitor:
      enabled: true
      interval: 15s
      scrapeTimeout: 10s
```

O `ServiceMonitor` exige as CRDs do Prometheus Operator já instaladas no cluster — por isso o release do stack de observabilidade (`kube-prometheus-stack`) precisa subir antes do release da aplicação. Como os templates do subchart não estão neste repositório, qualquer ajuste no contrato (novas probes, labels, portas) é feito via PR em `Bunzina/bunzina-chart`, não com manifests locais.

O stack de observabilidade em si (`kube-prometheus-stack` + Loki + Tempo + Alloy) vive em `charts/bunzina-observability/` — ver o README desse chart para detalhes de cada dependência, nomes de serviço e ordem de instalação. A app aponta `OTEL_EXPORTER_OTLP_ENDPOINT` para `http://alloy-gateway.observability.svc.cluster.local:4318` (já configurado em `charts/bunzina-chart/values.yaml`).

## Validação

```sh
bun test src/api/server.test.ts
bun run lint
bun run fmt:check
docker compose config
docker compose -f docker-compose.yml -f docker-compose.observability.yml config
```

Depois de subir a stack, confirme:

1. `GET /health` retorna `200` mesmo sem PostgreSQL.
2. `GET /ready` retorna `200` com o banco disponível e `503` quando o banco está indisponível.
3. `GET /metrics` retorna `text/plain; version=0.0.4`.
4. O target `bunzina` aparece como `UP` em Prometheus.
5. Uma requisição para uma rota dinâmica produz uma rota normalizada, sem CPF ou ID no output.
6. Os 5 dashboards aparecem automaticamente no Grafana, na pasta `Bunzina`.
7. Grafana → Alerting → Alert rules mostra as 4 regras com `provenance: file`.

Para validar o chart:

```sh
helm dependency build charts/bunzina-chart
helm lint charts/bunzina-chart
helm template bunzina charts/bunzina-chart
```

## Próximas extensões

Métricas adicionais de negócio devem continuar nos use cases, não nos repositories. Métricas detalhadas do PostgreSQL devem vir de um exporter próprio quando forem necessárias. Spans de query (hoje fora de escopo, já que `Bun.SQL` não é auto-instrumentado) podem ser adicionados manualmente em torno do `db` se a profundidade do trace não for suficiente.