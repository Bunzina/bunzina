# RFC 0003 — Banco de dados gerenciado

- Status: Aceita (desenho). Implementação ainda não começou.
- Autores: grupo Bunzina
- ADR: [0011](../adrs/0011-banco-gerenciado.md)

## Problema

O PDF pede banco gerenciado. Hoje o chart sobe Postgres in-cluster **e** o deploy já sabe usar um host externo. O `values.yaml` aponta para Supabase. Precisamos decidir o produto gerenciado, quem provisiona e onde ficam as migrations.

## Decisão

1. **Amazon RDS PostgreSQL** (versão alinhada ao 15 usado no chart), instância pequena (`db.t3.micro` ou o mínimo que o lab liberar), storage gp3, em subnet privada.
2. Provisionamento no repo `bunzina-infra-db`, Terraform, state separado.
3. **Migrations continuam em `bunzina`**. O repo de banco cria instância, SG, subnet group e secret — não o schema `bunzina`.
4. Em produção: `DB_HOST` preenchido → `app-chart.database.enabled=false`.
5. Lambda e API usam o mesmo endpoint.

## Por que RDS e não o Supabase atual

- O vídeo e o Terraform precisam mostrar provisionamento **na conta AWS**
- Os repos de referência do professor são Academy/SOAT em AWS
- Supabase pode continuar como atalho de desenvolvimento, não como entregável

## Rede e acesso

- Porta 5432 só a partir do SG dos nós EKS e do SG da Lambda
- SSL obrigatório (`sslmode=require`), como o job de migrate já prevê
- Sem acesso público na demo; migrate via CI com credencial no GitHub Environment `production`

## Tamanho (demo)

| Parâmetro | Valor sugerido | Motivo |
| --- | --- | --- |
| Classe | `db.t3.micro` | Cota e custo do lab |
| Storage | 20 GiB gp3 | Mínimo RDS, sobra para o schema |
| Multi-AZ | não | Custo; destruímos depois do vídeo |
| Backup | 1 dia ou desligado | Dado descartável |

## Alternativas rejeitadas

| Opção | Por que não |
| --- | --- |
| Só StatefulSet | Não é gerenciado |
| Aurora Serverless | Melhor escala, cota/preço piores no lab |
| Ficar no Supabase | Fora do Terraform AWS do grupo |

## Impacto

- Primeiro `apply` do repo de banco **antes** de desligar o Postgres do Helm em produção
- Dump/restore só se houver dado de demo que importe — em geral o seed se recria
- Documentar no README da aplicação que `bun dev` continua com Postgres do Compose
