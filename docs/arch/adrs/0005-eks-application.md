# ADR 0005 — Aplicação no EKS, não em Lambda

- Status: Aceita
- Data: Fase 2

## Contexto

A Fase 1 chegou a considerar Lambda para a API. A Fase 2 exige Kubernetes com escalabilidade. O PDF da Fase 3 ainda pede **uma** Function Serverless — para autenticação, não para o CRUD.

## Decisão

A API de negócio roda como Deployment no **EKS**. Lambda fica reservada ao fluxo de auth da Fase 3.

## Motivo

- HPA, probes, Ingress e demo de escala são nativos no K8s
- O processo Elysia é longo (listen :3000); encaixar tudo em Lambda exigiria adapter e frio em toda rota
- Separar auth serverless / API no cluster atende o PDF sem reescrever o domínio

## Consequências

- Custo de cluster no Academy (sobe só para gravar o vídeo)
- Dois modelos de compute para operar
- Terraform do EKS já existe em `infra/`

## Alternativas

- API inteira em Lambda + API Gateway — foge do requisito de K8s
- ECS/Fargate — válido, mas o PDF pede Kubernetes
