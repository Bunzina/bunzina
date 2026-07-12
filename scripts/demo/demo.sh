#!/usr/bin/env bash
#
# demo.sh — helper para gravar o vídeo demonstrativo da fase 2 (Bunzina em EKS).
#
# Cada subcomando é uma etapa isolada, pra você controlar o ritmo da gravação.
# Veja o roteiro completo em docs/video-demo/roteiro.md
#
# Uso:
#   scripts/demo/demo.sh <subcomando>
#
# Subcomandos:
#   preflight       Checa ferramentas, credenciais AWS e contexto do kubectl
#   addons          Instala metrics-server + AWS Load Balancer Controller (pré-req do HPA e do Ingress)
#   chart-publish   Publica o app-chart 0.1.0 no ECR (OCI) — one-time, a partir do repo irmão
#   deploy          Deploy manual do app via Helm (fallback/local — o CI faz o mesmo)
#   status          Visão geral rápida do cluster (nodes, pods, hpa, ingress)
#   endpoints       Exercita as APIs principais contra a ALB (health, swagger, listas + 1 escrita)
#   hpa-load        Sobe pods de carga in-cluster e monitora o HPA escalando
#   hpa-stop        Remove os pods de carga
#   collect-proofs  Snapshota nodes/pods/hpa/ingress/top em docs/video-demo/proofs/<timestamp>/
#   teardown        Lembrete de como destruir tudo (infra/destroy.sh)
#
set -euo pipefail

# ----------------------------------------------------------------------------
# Config (override por env)
# ----------------------------------------------------------------------------
REGION="${AWS_REGION:-us-east-1}"
CLUSTER="${EKS_CLUSTER_NAME:-bunzina-eks}"
NS="${K8S_NAMESPACE:-bunzina}"
APP="${APP_NAME:-bunzina}"          # nome do Deployment/Service/Ingress
SVC_PORT="${SVC_PORT:-80}"          # porta do Service (ClusterIP)
ECR_REPO="${ECR_REPOSITORY:-bunzina}"
CHART_REPO="${CHART_ECR_REPOSITORY:-app-chart}"
CHART_VERSION="${CHART_VERSION:-0.1.0}"

# Carga do HPA
LOAD_REPLICAS="${LOAD_REPLICAS:-3}"     # pods geradores de carga
LOAD_CONCURRENCY="${LOAD_CONCURRENCY:-25}"  # loops paralelos por pod
LOAD_PATH="${LOAD_PATH:-/service-orders?page=1&limit=50}" # endpoint mais pesado para o HPA
LOAD_DEPLOY="hpa-load"

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
PROOFS_DIR="${ROOT_DIR}/docs/video-demo/proofs"

# ----------------------------------------------------------------------------
# Helpers de saída
# ----------------------------------------------------------------------------
c_reset=$'\033[0m'; c_blue=$'\033[1;34m'; c_green=$'\033[1;32m'; c_red=$'\033[1;31m'; c_yellow=$'\033[1;33m'
say()  { printf '%s\n' "${c_blue}==>${c_reset} $*"; }
ok()   { printf '%s\n' "${c_green}OK ${c_reset} $*"; }
warn() { printf '%s\n' "${c_yellow}!! ${c_reset} $*" >&2; }
die()  { printf '%s\n' "${c_red}ERRO${c_reset} $*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

require_kube() {
  have kubectl || die "kubectl não encontrado."
  kubectl get ns "$NS" >/dev/null 2>&1 || die "namespace '$NS' não existe (o app já foi deployado?)."
}

account_id() { aws sts get-caller-identity --query Account --output text; }
ecr_registry() { echo "$(account_id).dkr.ecr.${REGION}.amazonaws.com"; }

# Descobre o hostname da ALB do Ingress (vazio se ainda não provisionou)
alb_host() {
  kubectl get ingress "$APP" -n "$NS" \
    -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true
}

# Lê a API_KEY do Secret publicado no cluster (ou usa $API_KEY do ambiente)
resolve_api_key() {
  if [[ -n "${API_KEY:-}" ]]; then echo "$API_KEY"; return; fi
  kubectl get secret "${APP}-secret" -n "$NS" \
    -o jsonpath='{.data.API_KEY}' 2>/dev/null | base64 -d
}

# ----------------------------------------------------------------------------
# Subcomandos
# ----------------------------------------------------------------------------
cmd_preflight() {
  say "Ferramentas"
  local missing=0
  for t in aws kubectl helm; do
    if have "$t"; then ok "$t: $(command -v "$t")"; else warn "$t: FALTANDO"; missing=1; fi
  done
  for t in terraform gh jq curl; do
    if have "$t"; then ok "$t: $(command -v "$t")"; else warn "$t: faltando (opcional pra algumas etapas)"; fi
  done
  [[ "$missing" -eq 1 ]] && die "Instale as ferramentas obrigatórias antes de continuar."

  say "Credenciais AWS (Learner Lab)"
  if aws sts get-caller-identity >/tmp/_who 2>/tmp/_werr; then
    ok "Autenticado — conta $(account_id)"
  else
    warn "$(cat /tmp/_werr)"
    die "Credenciais inválidas/expiradas. Cole as credenciais novas do Learner Lab em ~/.aws/credentials (ou exporte AWS_ACCESS_KEY_ID/SECRET/SESSION_TOKEN) e rode de novo."
  fi

  say "Contexto do kubectl"
  if kubectl config current-context >/tmp/_ctx 2>/dev/null; then
    ok "contexto: $(cat /tmp/_ctx)"
    if kubectl get nodes >/dev/null 2>&1; then
      ok "cluster acessível ($(kubectl get nodes --no-headers 2>/dev/null | wc -l | tr -d ' ') node(s))"
    else
      warn "contexto existe mas o cluster não responde — rode: aws eks update-kubeconfig --name $CLUSTER --region $REGION"
    fi
  else
    warn "sem contexto kube — rode: aws eks update-kubeconfig --name $CLUSTER --region $REGION"
  fi
}

cmd_addons() {
  have helm || die "helm não encontrado."
  local vpc_id
  vpc_id="$(aws eks describe-cluster --name "$CLUSTER" --region "$REGION" \
    --query 'cluster.resourcesVpcConfig.vpcId' --output text)"
  [[ -n "$vpc_id" && "$vpc_id" != "None" ]] || die "não consegui descobrir o VPC do cluster $CLUSTER."
  ok "VPC do cluster: $vpc_id"

  say "metrics-server (necessário pro HPA ler CPU)"
  helm repo add metrics-server https://kubernetes-sigs.github.io/metrics-server/ >/dev/null 2>&1 || true
  helm repo update metrics-server >/dev/null
  helm upgrade --install metrics-server metrics-server/metrics-server \
    -n kube-system --set 'args={--kubelet-insecure-tls}' --wait --timeout 5m
  ok "metrics-server instalado"

  say "AWS Load Balancer Controller (necessário pro Ingress ALB)"
  warn "Learner Lab: sem IRSA — o controller usa a role do nó (LabRole) via IMDS (hop-limit 2)."
  helm repo add eks https://aws.github.io/eks-charts >/dev/null 2>&1 || true
  helm repo update eks >/dev/null
  helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName="$CLUSTER" \
    --set region="$REGION" \
    --set vpcId="$vpc_id" \
    --set serviceAccount.create=true \
    --set serviceAccount.name=aws-load-balancer-controller \
    --wait --timeout 5m
  ok "aws-load-balancer-controller instalado"
}

cmd_chart_publish() {
  have helm || die "helm não encontrado."
  local reg; reg="$(ecr_registry)"
  # Fonte do app-chart: repo irmão. Procura o .tgz empacotado ou empacota do source.
  local sibling="${SIBLING_CHART_DIR:-$ROOT_DIR/../bunzina-chart}"
  local tgz=""
  if [[ -f "$sibling/${CHART_REPO}-${CHART_VERSION}.tgz" ]]; then
    tgz="$sibling/${CHART_REPO}-${CHART_VERSION}.tgz"
  elif [[ -f "$ROOT_DIR/charts/bunzina-chart/charts/${CHART_REPO}-${CHART_VERSION}.tgz" ]]; then
    tgz="$ROOT_DIR/charts/bunzina-chart/charts/${CHART_REPO}-${CHART_VERSION}.tgz"
  elif [[ -d "$sibling/charts/app-chart" ]]; then
    say "Empacotando app-chart a partir de $sibling/charts/app-chart"
    tgz="$(helm package "$sibling/charts/app-chart" -d /tmp | awk '{print $NF}')"
  else
    die "não achei o app-chart (.tgz ou source). Ajuste SIBLING_CHART_DIR (atual: $sibling)."
  fi
  ok "chart: $tgz"

  say "Login no ECR (OCI) e push"
  aws ecr get-login-password --region "$REGION" | helm registry login --username AWS --password-stdin "$reg"
  helm push "$tgz" "oci://${reg}"
  ok "app-chart ${CHART_VERSION} publicado em oci://${reg}/${CHART_REPO}"
}

cmd_deploy() {
  have helm || die "helm não encontrado."
  local reg; reg="$(ecr_registry)"
  local tag="${IMAGE_TAG:-latest}"
  local secret_file="$ROOT_DIR/charts/bunzina-chart/values.secret.yaml"
  [ -f "$secret_file" ] || die "faltando $secret_file (copie de values.secret.example.yaml e preencha com as credenciais reais: DB do Supabase, JWT, API_KEY)."

  say "Login no ECR (OCI) e resolução da dependência"
  aws ecr get-login-password --region "$REGION" | helm registry login --username AWS --password-stdin "$reg"
  helm dependency update "$ROOT_DIR/charts/bunzina-chart"

  say "helm upgrade --install (imagem tag=$tag, secrets de values.secret.yaml)"
  helm upgrade --install "$APP" "$ROOT_DIR/charts/bunzina-chart" \
    --namespace "$NS" --create-namespace \
    -f "$secret_file" \
    --set app-chart.app.image.repository="${reg}/${ECR_REPO}" \
    --set app-chart.app.image.tag="$tag" \
    --wait --timeout 10m

  # ConfigMap/Secret mudam sem reiniciar os pods -> força rollout p/ pegar os envs novos
  kubectl rollout restart "deployment/$APP" -n "$NS"
  kubectl rollout status "deployment/$APP" -n "$NS" --timeout=180s
  ok "deploy concluído"
}

cmd_status() {
  require_kube
  say "Nodes";    kubectl get nodes -o wide || true
  say "Pods ($NS)";     kubectl get pods -n "$NS" -o wide || true
  say "HPA ($NS)";      kubectl get hpa -n "$NS" || true
  say "Ingress ($NS)";  kubectl get ingress -n "$NS" || true
  local host; host="$(alb_host)"
  [[ -n "$host" ]] && ok "ALB: http://$host" || warn "ALB ainda sem hostname (aguarde o controller provisionar)."
}

cmd_endpoints() {
  require_kube
  have curl || die "curl não encontrado."
  local host; host="$(alb_host)"
  [[ -n "$host" ]] || die "Ingress sem hostname ainda. Rode 'demo.sh addons' e aguarde a ALB. (veja 'demo.sh status')"
  local base="http://${host}"
  local key; key="$(resolve_api_key)"
  [[ -n "$key" ]] || die "não consegui obter a API_KEY (secret ${APP}-secret). Exporte API_KEY=... se necessário."
  local H_KEY=(-H "Api-Key: ${key}")
  local jqf="cat"; have jq && jqf="jq ."

  hr() { printf '\n%s\n' "────────────────────────────────────────────────────────"; }
  show() { # <descrição> <método> <path> [body]
    local desc="$1" method="$2" path="$3" body="${4:-}"
    hr; say "$desc"; echo "  ${method} ${base}${path}"
    local args=(-sS -m 20 -o /tmp/_resp -w '  HTTP %{http_code}  (%{time_total}s)\n' -X "$method" "${base}${path}")
    [[ "$method" != "GET" ]] && args+=(-H 'Content-Type: application/json' "${H_KEY[@]}" -d "$body")
    [[ "$method" == "GET" && "$path" != "/health" && "$path" != /swagger* ]] && args+=("${H_KEY[@]}")
    curl "${args[@]}" || true
    if [[ -s /tmp/_resp ]]; then head -c 800 /tmp/_resp | $jqf 2>/dev/null || head -c 800 /tmp/_resp; echo; fi
  }

  say "Base URL: $base   (Swagger em ${base}/swagger)"
  show "Health check (público)"           GET  /health
  show "Listar ordens de serviço"         GET  /service-orders
  show "Listar veículos"                  GET  /vehicles
  show "Listar peças (auto-parts)"        GET  /auto-parts
  show "Listar serviços"                  GET  /services

  local doc="123.456.789-09"
  local payload
  payload=$(cat <<JSON
{"name":"João Demo","document":"${doc}","email":"joao.demo@bunzina.local","phone":"+5511999999999",
"address":{"street":"Rua das Flores","number":"42","neighborhood":"Centro","city":"São Paulo","state":"SP","zipCode":"01310-100"}}
JSON
)
  show "Criar cliente (escrita)"          POST /customers "$payload"
  show "Consultar cliente criado"         GET  "/customers/${doc}"
  hr; ok "Fim do happy-path das APIs."
}

cmd_hpa_load() {
  require_kube
  local target="http://${APP}.${NS}.svc.cluster.local:${SVC_PORT}${LOAD_PATH}"
  local key; key="$(resolve_api_key 2>/dev/null || true)"
  local header_fragment=""
  if [[ -n "$key" ]]; then
    header_fragment=' --header="Api-Key: '"$key"'"'
  fi

  say "Subindo gerador de carga: ${LOAD_REPLICAS} pod(s) × ${LOAD_CONCURRENCY} loops → ${target}"

  kubectl apply -n "$NS" -f - <<YAML
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${LOAD_DEPLOY}
  labels: { app: ${LOAD_DEPLOY} }
spec:
  replicas: ${LOAD_REPLICAS}
  selector: { matchLabels: { app: ${LOAD_DEPLOY} } }
  template:
    metadata: { labels: { app: ${LOAD_DEPLOY} } }
    spec:
      containers:
        - name: load
          image: busybox:1.36
          command: ["/bin/sh","-c"]
          args:
            - >
              for i in \$(seq 1 ${LOAD_CONCURRENCY}); do
                (while true; do wget -q -O /dev/null${header_fragment} "${target}" 2>/dev/null || true; done) &
              done; wait
YAML

  ok "Carga aplicada. Deixe rodando ~1-3 min e observe o HPA escalar."
  say "Dica p/ tela dividida: em outro terminal rode  kubectl get pods -n $NS -w"
  echo
  say "Monitorando HPA (Ctrl-C pra parar o monitor; a carga continua até 'hpa-stop')"
  local start=$SECONDS
  while true; do
    printf '\n%s  (+%ss)\n' "$(date +%H:%M:%S)" "$((SECONDS-start))"
    kubectl get hpa "$APP" -n "$NS" 2>/dev/null || true
    printf 'réplicas do app: '
    kubectl get deploy "$APP" -n "$NS" -o jsonpath='{.status.readyReplicas}/{.spec.replicas}{"\n"}' 2>/dev/null || echo '?'
    kubectl top pods -n "$NS" -l "app.kubernetes.io/name=${APP}" 2>/dev/null || warn "kubectl top indisponível (metrics-server pronto?)"
    sleep 10
  done
}

cmd_hpa_stop() {
  require_kube
  say "Removendo gerador de carga"
  kubectl delete deployment "$LOAD_DEPLOY" -n "$NS" --ignore-not-found
  ok "Carga removida. O HPA vai reduzir réplicas após a janela de scaleDown (~2 min)."
}

cmd_collect_proofs() {
  require_kube
  local ts; ts="$(date +%Y%m%d-%H%M%S)"
  local dir="${PROOFS_DIR}/${ts}"
  mkdir -p "$dir"
  say "Coletando provas em ${dir}"
  { kubectl get nodes -o wide;                     } > "${dir}/nodes.txt" 2>&1 || true
  { kubectl get all -n "$NS" -o wide;              } > "${dir}/all.txt" 2>&1 || true
  { kubectl get hpa -n "$NS";                      } > "${dir}/hpa.txt" 2>&1 || true
  { kubectl describe hpa "$APP" -n "$NS";          } > "${dir}/hpa-describe.txt" 2>&1 || true
  { kubectl get ingress -n "$NS" -o wide;          } > "${dir}/ingress.txt" 2>&1 || true
  { kubectl top pods -n "$NS";                     } > "${dir}/top-pods.txt" 2>&1 || true
  { kubectl top nodes;                             } > "${dir}/top-nodes.txt" 2>&1 || true
  { echo "Coletado em $(date -Iseconds)"; echo "ALB: http://$(alb_host)"; } > "${dir}/_meta.txt" 2>&1 || true
  ok "Provas salvas em ${dir}"
  ls -1 "$dir"
}

cmd_teardown() {
  cat <<EOF
Para destruir tudo depois de gravar:

  1) Remover o app do cluster:
       helm uninstall ${APP} -n ${NS} || true
       kubectl delete ns ${NS} --ignore-not-found

  2) Remover addons (opcional):
       helm uninstall aws-load-balancer-controller -n kube-system || true
       helm uninstall metrics-server -n kube-system || true

  3) Destruir a infra (VPC/EKS/ECR):
       cd ${ROOT_DIR}/infra && ./destroy.sh
     (ou via pipeline: gh workflow run terraform.yml  — se houver job de destroy)

  Confira no console AWS se a ALB/target groups foram removidos (o LB controller
  cria recursos fora do Terraform; destrua o Ingress ANTES do 'terraform destroy').
EOF
}

usage() { sed -n '2,30p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; }

main() {
  local sub="${1:-}"; shift || true
  case "$sub" in
    preflight)      cmd_preflight "$@";;
    addons)         cmd_addons "$@";;
    chart-publish)  cmd_chart_publish "$@";;
    deploy)         cmd_deploy "$@";;
    status)         cmd_status "$@";;
    endpoints)      cmd_endpoints "$@";;
    hpa-load)       cmd_hpa_load "$@";;
    hpa-stop)       cmd_hpa_stop "$@";;
    collect-proofs) cmd_collect_proofs "$@";;
    teardown)       cmd_teardown "$@";;
    ""|-h|--help|help) usage;;
    *) die "subcomando desconhecido: '$sub' (rode sem argumentos pra ver a ajuda)";;
  esac
}
main "$@"
