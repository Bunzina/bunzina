# Cluster EKS

O cluster já está provisionado. Na Fase 3 ele deixa de ser a porta pública: recebe só o tráfego que o API Gateway encaminhou.

![Cluster EKS](../eks.png)

## Recursos Kubernetes

| Recurso | Configuração atual |
| --- | --- |
| Deployment | imagem ECR, 2 réplicas iniciais, `USER` não-root |
| Service | ClusterIP porta 80 → container 3000 |
| Ingress | classe `alb`, internet-facing, healthcheck `/health` |
| HPA | min 2, max 10, alvo 70% de CPU |
| Probes | HTTP GET `/health` |
| ConfigMap | `APP_ENV`, host/porta/nome do banco, SMTP, `JWT_EXPIRES_IN` |
| Secret | `PROD_DB_USER`, `PROD_DB_PASSWORD`, `JWT_SECRET`, `API_KEY` |

O Helm não cria o Namespace: o deploy usa `--create-namespace`. Segredos não entram no Git (`values.secret.yaml` gitignored).

## Postgres in-cluster (legado da Fase 2)

O chart ainda pode subir um StatefulSet Postgres + PVC `gp3` de 10Gi. O workflow de deploy **desliga** esse StatefulSet quando `DB_HOST` está definido (`--set app-chart.database.enabled=false`). Na Fase 3 o banco primário é o gerenciado; o in-cluster fica só como fallback local/demo.

## Addons e restrições do Learner Lab

| Addon / ajuste | Por quê |
| --- | --- |
| vpc-cni, kube-proxy, coredns | Rede e DNS do cluster |
| aws-ebs-csi-driver + StorageClass `gp3` | PVC do Postgres legado |
| IMDS hop-limit 2 | Sem isso, CSI e ALB controller entram em CrashLoop |
| LabRole / voclabs | O lab não permite IAM próprio nem IRSA |
| Região `us-east-1` | Única região estável no Academy |
