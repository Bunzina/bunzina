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

Suba a aplicação, o PostgreSQL, o Prometheus e o Grafana com:

```sh
docker compose up --build
```

Endereços locais:

- API: `http://localhost:3000`
- Métricas: `http://localhost:3000/metrics`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`

O usuário e a senha padrão do Grafana são `admin`/`admin`. Para alterar a senha local:

```sh
GRAFANA_ADMIN_USER=admin GRAFANA_ADMIN_PASSWORD=change-me docker compose up
```

O Prometheus faz scrape de `app:3000/metrics`. O Alloy coleta os logs dos containers pelo Docker socket e envia os eventos JSON para o Loki. Os datasources e dashboards do Grafana são provisionados automaticamente a partir de `observability/`.

Endereços adicionais:

- Loki: `http://localhost:3100`
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

## Alertas e dashboard

O dashboard inicial está em `observability/grafana/dashboards/bunzina-api.json` e mostra tráfego, latência P95, requisições em voo, autenticação, notificações e eventos de ordens de serviço.

As regras em `observability/prometheus/alerts.yml` cobrem:

- target da API indisponível;
- taxa de respostas 5xx acima de 5% por 10 minutos;
- latência P95 acima de um segundo por 10 minutos.

Os limiares são valores iniciais e devem ser ajustados conforme o tráfego real. Todo alerta de produção deve ter um canal de notificação e um runbook associado.

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

## Validação

```sh
bun test src/api/server.test.ts
bun run lint
bun run fmt:check
docker compose config
```

Depois de subir a stack, confirme:

1. `GET /health` retorna `200` mesmo sem PostgreSQL.
2. `GET /ready` retorna `200` com o banco disponível e `503` quando o banco está indisponível.
3. `GET /metrics` retorna `text/plain; version=0.0.4`.
4. O target `bunzina` aparece como `UP` em Prometheus.
5. Uma requisição para uma rota dinâmica produz uma rota normalizada, sem CPF ou ID no output.
6. O dashboard aparece automaticamente no Grafana.

Para validar o chart:

```sh
helm dependency build charts/bunzina-chart
helm lint charts/bunzina-chart
helm template bunzina charts/bunzina-chart
```

## Próximas extensões

Métricas adicionais de negócio devem continuar nos use cases, não nos repositories. Métricas detalhadas do PostgreSQL devem vir de um exporter próprio quando forem necessárias. Spans de query (hoje fora de escopo, já que `Bun.SQL` não é auto-instrumentado) podem ser adicionados manualmente em torno do `db` se a profundidade do trace não for suficiente.