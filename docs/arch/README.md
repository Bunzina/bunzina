# Documentação da Arquitetura

Esta pasta centraliza a documentação de arquitetura do Bunzina. Os demais repositórios da Fase 3 devem apenas referenciar estes documentos.

| Documento | Conteúdo |
| --- | --- |
| [Visão geral](./overview.md) | Componentes, fluxos, repositórios e infraestrutura |
| [Banco de dados](./database.md) | PostgreSQL, schema, tabelas, migrations e relacionamentos |
| [Diagramas](./diagrams/README.md) | Nuvem, EKS, API Gateway/Lambda, sequências e modelo ER |
| [ADRs](./adrs/README.md) | Decisões arquiteturais e o motivo de cada uma |
| [RFCs](./rfcs/README.md) | Decisões técnicas do grupo para a Fase 3 |

Documentos complementares fora desta pasta:

- [Domain Design (DDD)](../domain.md) — bounded context, agregados, linguagem ubíqua e máquina de estados
- [Domain Storytelling](../domain-storytelling/) — narrativas de criação de veículo, abertura e aprovação de OS

- [Provisionamento do PostgreSQL no EKS](../adrs/adr-001-postgresql-terraform.md) — decisão vigente do banco
- [Observabilidade](../observability.md) — métricas, logs, traces e alertas
