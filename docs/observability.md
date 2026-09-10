# Observabilidade

## Estado atual

A API Bunzina expõe métricas Prometheus em `GET /metrics` e possui duas probes:

- `GET /health`: liveness, sem dependências externas.
- `GET /ready`: readiness, executa uma consulta simples no PostgreSQL.

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

O Prometheus faz scrape de `app:3000/metrics`. O datasource e o dashboard inicial do Grafana são provisionados automaticamente a partir de `observability/`.

## Métricas HTTP

As métricas são mantidas em `src/infrastructure/observability/metrics.ts`, que encapsula o `prom-client` e seu `Registry`:

- `bunzina_http_requests_total`: contador por `method`, `route` e `status_code`.
- `bunzina_http_request_duration_seconds`: histograma por `method`, `route` e `status_code`.
- `bunzina_http_requests_in_flight`: requisições em processamento.

Também são coletadas métricas padrão do processo Node/Bun pelo cliente Prometheus.

As rotas dinâmicas são normalizadas para evitar cardinalidade alta. Documentos, IDs, query strings, tokens, e-mails e payloads nunca devem ser adicionados como labels.

## Alertas e dashboard

O dashboard inicial está em `observability/grafana/dashboards/bunzina-api.json` e mostra tráfego, latência P95 e requisições em voo.

As regras em `observability/prometheus/alerts.yml` cobrem:

- target da API indisponível;
- taxa de respostas 5xx acima de 5% por 10 minutos;
- latência P95 acima de um segundo por 10 minutos.

Os limiares são valores iniciais e devem ser ajustados conforme o tráfego real. Todo alerta de produção deve ter um canal de notificação e um runbook associado.

## Kubernetes

O chart local é um umbrella chart e delega os templates ao `app-chart` distribuído via OCI. Os valores de métricas foram adicionados em `charts/bunzina-chart/values.yaml`:

```yaml
app:
  metrics:
    enabled: true
    path: /metrics
    port: 3000
    serviceMonitor:
      enabled: false
      interval: 15s
```

Antes do deploy, confirme se a versão do `app-chart` suporta:

1. porta de métricas no Service;
2. annotations de scrape ou recurso `ServiceMonitor`;
3. probes separadas para `/health` e `/ready`.

Se houver Prometheus Operator, habilite `serviceMonitor.enabled`. Caso contrário, use annotations no Service. Como os templates do subchart não estão neste repositório, não adicione manifests locais que possam divergir do contrato do chart OCI.

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

As métricas de negócio devem ser adicionadas nos use cases, não nos repositories. Priorize ordens criadas/concluídas, logins com falha, notificações com falha e movimentações de estoque. Métricas detalhadas do PostgreSQL devem vir de um exporter próprio quando forem necessárias. Tracing distribuído e centralização de logs ficam fora deste primeiro incremento.