# ADR 0011 — PostgreSQL gerenciado fora do cluster

- Status: Proposta
- Data: Fase 3
- RFC: [0003](../rfcs/0003-managed-database.md)

## Contexto

A Fase 2 colocou Postgres em StatefulSet + PVC. O PDF da Fase 3 pede banco **gerenciado**. O deploy **já** aceita host externo (`DB_HOST` desliga o StatefulSet). O `values.yaml` aponta hoje para um pooler Supabase.

## Decisão

Provisionar **Amazon RDS PostgreSQL** (ou Aurora PostgreSQL se a cota do lab permitir) no repositório de infra de banco. A aplicação continua falando SQL no schema `bunzina`. O StatefulSet vira fallback de demo local, desligado em produção.

## Motivo

- RDS é o gerenciado canônico no Terraform Academy (`dougls/terraform-academy`, `dougls/terraform-soat`)
- Mesmo dialeto, zero mudança de repositório/domínio
- Tira I/O e memória de Postgres dos nós `t3.medium`
- Supabase funciona, mas fica fora da conta AWS do vídeo e do Terraform do grupo

## Consequências

- Mais um recurso para destruir depois da gravação
- Lambda e API usam o mesmo endpoint
- Security group: 5432 só a partir do node group e da Lambda
- Senha no Secrets Manager ou no Secret do Helm, nunca no Git

## Alternativas

- Manter só Supabase — já conecta, mas não demonstra provisionamento Terraform de banco
- Postgres no EKS — não atende o requisito de gerenciado
