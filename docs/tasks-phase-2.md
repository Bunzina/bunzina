# 📋 Tasks — Fase 2 (14SOAT)

Checklist de implementação para evoluir o projeto da Fase 1 à Fase 2.

## Prioridade: Alta
- [ ] Ajustar listagem de Ordens de Serviço: ordenar por status (Em Execução > Aguardando Aprovação > Diagnóstico > Recebida) e, dentro do mesmo status, mais antigas primeiro. Excluir logicamente OS com status `COMPLETED` ou `DELIVERED` da listagem pública.
  - Arquivos relacionados: `src/infrastructure/repositories/service-order/service-order-repository.ts`, `src/application/use-cases/service-order/list.ts`, `src/adapters/input/service-order/list.ts`.
- [ ] Implementar endpoint de abertura de Ordem de Serviço que receba cliente, veículo, serviços e peças em uma única requisição.
  - A OS deve nascer com status inicial `RECEIVED`.
  - Ponto de atenção: a API de abertura já existe e hoje recebe os IDs de referência das entidades; se isso já atender ao que foi pedido, não precisa modificar nada nesse ponto.
- [ ] Implementar endpoint público seguro para receber aprovações externas (webhook) e atualizar o `approvedAt` / status da OS.
  - Ponto de partida: `src/api/handlers/service-order/update.ts` e `src/api/handlers/service-order/schema.ts`.
- [ ] Garantir que a documentação da API permita validar rapidamente os endpoints novos e alterados durante a avaliação.
  - Informar no README como acessar o Swagger localmente e onde está a collection completa das APIs.

## Prioridade: Média
- [ ] Implementar processamento de inbound email para atualizar status (se exigido). Alternativa: usar um serviço que converta email em webhook.
  - Arquivos/áreas: infra / integração com provider (ex.: Mailgun, SendGrid) ou criar worker que conecta IMAP.
- [ ] Criar manifestos Kubernetes mínimos em `/k8s`: `deployment.yaml`, `service.yaml`, `configmap.yaml`, `secret.yaml` (exemplo), `hpa.yaml`.
- [ ] Adicionar scripts Terraform em `/infra` para provisionar cluster (local/cloud) e banco de dados; documentar recursos criados.
- [ ] Disponibilizar os diagramas de arquitetura no repositório, preferencialmente em `docs/arch/` como PNG.
  - Pode ser um diagrama único ou vários diagramas por contexto.

## Prioridade: Baixa / Finalização
- [ ] Adaptar pipeline CI/CD (GitHub Actions) para: build → testes → build imagem → push → deploy em Kubernetes (aplicar manifestos). Atualizar `.github/workflows` ou criar novo workflow `deploy-k8s.yml`.
- [ ] Atualizar `README.md` com arquitetura da fase 2, instruções de deploy local/K8s e uso dos scripts Terraform.
- [ ] Validar e aumentar cobertura de testes nas áreas alteradas (listagem, webhook, email). Garantir cobertura ≥ 80% nos domínios críticos.
- [ ] Produzir vídeo demonstrativo (~15 minutos) mostrando deploy, CI/CD e escalabilidade e gerar PDF final de entrega.
  - O vídeo deve mostrar deploy, execução do CI/CD, consumo das APIs principais e escalabilidade automática com HPA; na parte de deploy e de CI/CD, pode ser mostrada uma execução bem-sucedida com explicação rápida das etapas.
  - Se sobrar tempo, incluir arquitetura, Clean Architecture/Hexagonal, testes, Terraform e observabilidade.

## Prioridade: Muito Baixa
Esses itens são melhorias em relação à fase 1, baseadas no feedback do professor, e só entram se houver tempo para refinamento.
- [ ] Evoluir o Dockerfile para multi-stage.
- [ ] Rodar a aplicação com usuário não root.
- [ ] Adicionar um `.dockerignore`.
- [ ] Aprofundar o relatório de vulnerabilidades, mostrando as findings analisadas e não apenas o link.
- [x] Verificar se o Domain Storytelling já está devidamente adicionado; se já estiver, considerar esse ponto fechado.

## Notas
- Os pontos levantados na apresentação reforçam que a entrega precisa deixar claro onde estão os diagramas, como executar a aplicação e como testar as APIs sem depender só da collection.
- Conferir se nossa abordagem de Clean Architecture está bem purista, já que o professor frisou que precisa ser uma abordagem bem acadêmica.

## README — conteúdo obrigatório / README — required content

Português:
- [ ] Passo a passo para executar a API localmente (`bun install`, `docker compose up` ou `bun --hot run src/api/server.ts`), como configurar variáveis de ambiente e executar migrations (`bun run migration`).
- [ ] Passo a passo de uso da API com exemplos (`curl`) e link/arquivo da collection (Postman/Insomnia).
- [ ] Link ou instruções para acessar a documentação Swagger/OpenAPI localmente (ex.: `http://localhost:3000/docs` ou `http://localhost:3000/swagger`).
- [ ] Desenho da arquitetura com:
  - Componentes da aplicação (API, workers, DB, serviços externos).
  - Infraestrutura provisionada (K8s cluster, DB, storage, secrets management).
  - Fluxo de deploy (build → tests → image push → apply manifests / terraform apply).
- [ ] Seção indicando onde ficam os diagramas, por exemplo: `docs/arch`.
