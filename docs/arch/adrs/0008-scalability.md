# ADR 0008 — Valores de escalabilidade

- Status: Aceita

## Decisão

| Camada | Configuração |
| --- | --- |
| Instâncias do node group | `t3.medium` |
| Nós | Mínimo 1, desejado 2, máximo 4 |
| HPA da API | 2–10 pods; alvo de CPU 70% do request |
| Request por pod da API | 100m CPU / 128Mi memória |
| Limit por pod da API | 500m CPU / 256Mi memória |
| Armazenamento do banco | PVC gp3 de 10 GiB |
| NAT | Um gateway |
| IMDS hop-limit dos nós | 2 |

## Motivo

Os valores limitam o consumo inicial do ambiente de estudos. O metrics-server
é provisionado em `bunzina-infra/infra/addons.tf` e fornece as métricas usadas pelo HPA.
O alvo de CPU é relativo ao request de 100m, não ao limit de 500m.

## Consequências

- O HPA ajusta o número de pods da API; ele não aumenta o número de nós.
- Os limites do node group não equivalem à instalação de um Cluster Autoscaler. A capacidade dos nós deve acompanhar os pods solicitados.
- Duas réplicas reduzem o impacto da perda de um pod, mas não garantem disponibilidade de toda a solução.
- PostgreSQL e observabilidade também consomem recursos do cluster; o banco tem uma réplica e requer cuidados próprios de disponibilidade e backup.
- Uma única saída NAT concentra a dependência de rede para destinos públicos.

Os valores são pontos de partida e devem ser revistos com métricas de carga.

## Fontes

- Repositório `bunzina-infra`: `infra/variables.tf` e `infra/addons.tf`.
- [Valores da aplicação](../../../charts/bunzina-chart/values.yaml)
- [Provisionamento do banco](../../adrs/adr-001-postgresql-terraform.md)
