# ADR 0008 — Valores de escalabilidade

- Status: Aceita
- Data: Fase 2

## Contexto

O PDF pede cluster Kubernetes com escalabilidade. O ambiente é AWS Academy Learner Lab: cota baixa, só `us-east-1`, sem IAM próprio. Os números precisam caber no lab e ainda demonstrar HPA no vídeo.

## Decisão

| Camada | Valor | Motivo |
| --- | --- | --- |
| Instância do nó | `t3.medium` | 2 vCPU / 4 GiB. `t3.small` não segura API + addons + Postgres legado |
| Nós | min 1, desired 2, max 4 | 2 nós para AZ/HA na demo; max 4 evita estourar vCPU do lab |
| Réplicas da API | min 2, max 10 | min 2 elimina SPOF; 10 é teto de demo, não de produção real |
| HPA | CPU 70% | Escala antes do limit (500m); metrics-server já instalado |
| Requests | 100m CPU / 128Mi | Cabe ~várias réplicas em 2× t3.medium com kube-system |
| Limits | 500m CPU / 256Mi | Teto por pod; HPA age no request/utilização |
| Volumes | gp3, 10Gi | CSI já no cluster; barato e expansível |
| NAT | 1 gateway | Custo. Duas AZs só para o ALB |
| IMDS hop-limit | 2 | Sem isso, EBS CSI e ALB controller CrashLoop no lab |

## Motivo

Os valores são de **demonstração previsível**, não de capacity planning de oficina real. 70% de CPU com limit 500m faz o HPA reagir com `hey` em poucos segundos — requisito do vídeo.

## Consequências

- Cluster ocioso ainda custa (NAT + 2× t3.medium): destruir depois da gravação
- Max 10 réplicas × 500m = 5 vCPU; o node group max 4× t3.medium aguenta, mas o pending aparece se o cluster não escalar a tempo — isso também demonstra o limite
- Postgres in-cluster compete por recurso; na Fase 3 o banco sai do nó (ADR 0011) e a API ganha folga

## Alternativas

- minReplicas 1 — mais barato, pior demo (queda no rollout)
- targetCPU 50% — escala cedo demais no lab
- Instâncias maiores — risco de quota
