# 📋 Tasks — Fase 2 (14SOAT)

Checklist de implementação para evoluir o projeto da Fase 1 à Fase 2.

## Prioridade: Alta

- [X] Ajustar listagem de Ordens de Serviço: ordenar por status (Em Execução > Aguardando Aprovação > Diagnóstico > Recebida) e, dentro do mesmo status, mais antigas primeiro. Excluir logicamente OS com status `COMPLETED` ou `DELIVERED` da listagem pública.
  - Arquivos relacionados: `src/infrastructure/repositories/service-order/service-order-repository.ts`, `src/application/use-cases/service-order/list.ts`, `src/adapters/input/service-order/list.ts`.
- [ ] Implementar endpoint público seguro para receber aprovações externas (webhook) e atualizar o `approvedAt` / status da OS.
  - Ponto de partida: `src/api/handlers/service-order/update.ts` e `src/api/handlers/service-order/schema.ts`.

## Prioridade: Média

- [ ] Implementar processamento de inbound email para atualizar status (se exigido). Alternativa: usar um serviço que converta email em webhook.
  - Arquivos/áreas: infra / integração com provider (ex.: Mailgun, SendGrid) ou criar worker que conecta IMAP.
- [ ] Criar manifestos Kubernetes mínimos em `/k8s`: `deployment.yaml`, `service.yaml`, `configmap.yaml`, `secret.yaml` (exemplo), `hpa.yaml`.
- [ ] Adicionar scripts Terraform em `/infra` para provisionar cluster (local/cloud) e banco de dados; documentar recursos criados.

## Prioridade: Baixa / Finalização

- [ ] Adaptar pipeline CI/CD (GitHub Actions) para: build → testes → build imagem → push → deploy em Kubernetes (aplicar manifestos). Atualizar `.github/workflows` ou criar novo workflow `deploy-k8s.yml`.
- [ ] Atualizar `README.md` com arquitetura da fase 2, instruções de deploy local/K8s e uso dos scripts Terraform.
- [ ] Validar e aumentar cobertura de testes nas áreas alteradas (listagem, webhook, email). Garantir cobertura ≥ 80% nos domínios críticos.
- [ ] Produzir vídeo demonstrativo (~15 minutos) mostrando deploy, CI/CD e escalabilidade e gerar PDF final de entrega.

## Notas

- Comece pelo item de alta prioridade para alinhar com requisitos de listagem/fluxo de aprovação.
- Posso abrir PRs com mudanças incrementais (ex.: PR só para alteração da query de listagem) para revisão.

## README — conteúdo obrigatório / README — required content

Português:

- [ ] Passo a passo para executar a API localmente (`bun install`, `docker compose up` ou `bun --hot run src/api/server.ts`), como configurar variáveis de ambiente e executar migrations (`bun run migration`).
- [ ] Passo a passo de uso da API com exemplos (`curl`) e link/arquivo da collection (Postman/Insomnia).
- [ ] Link ou instruções para acessar a documentação Swagger/OpenAPI localmente (ex.: `http://localhost:3000/docs` ou `http://localhost:3000/swagger`).
- [ ] Desenho da arquitetura com:
  - Componentes da aplicação (API, workers, DB, serviços externos).
  - Infraestrutura provisionada (K8s cluster, DB, storage, secrets management).
  - Fluxo de deploy (build → tests → image push → apply manifests / terraform apply).
