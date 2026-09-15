# Diagramas

Diagramas dos componentes, fluxos e modelo de dados da aplicação.

## Fase 2

| Diagrama | O que mostra |
| --- | --- |
| [application-components.png](../application-components.png) | Componentes da aplicação e serviços externos |
| [infrastructure-provisioning.png](../infrastructure-provisioning.png) | Infraestrutura provisionada (cluster, banco, storage e secrets) |
| [deploy.png](../deploy.png) | Fluxo de deploy (build, testes, push de imagem e deploy) |

## Fase 3

| Diagrama | O que mostra |
| --- | --- |
| [cloud-overview.png](../cloud-overview.png) | Quem chama quem na AWS |
| [api-gateway-lambda.png](../api-gateway-lambda.png) | Porta de entrada e autenticação serverless |
| [eks.png](../eks.png) | Cluster, workloads e tráfego interno |
| [sequence-auth.png](../sequence-auth.png) | Fluxo de autenticação com CPF |
| [sequence-service-order.png](../sequence-service-order.png) | Abertura da ordem de serviço |
| [er.png](../er.png) | Modelo relacional atual do schema `bunzina` |

A explicação de cada imagem fica no markdown correspondente desta pasta.

O modelo relacional possui uma fonte textual em [er.md](./er.md). A imagem deve
ser atualizada junto com as migrations para evitar divergência entre o diagrama
e o schema implantado.
