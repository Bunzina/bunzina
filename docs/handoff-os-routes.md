# Handoff: migração das rotas de ordem de serviço

## Objetivo

Concluir no `bunzina-os` a migração das operações de ordem de serviço que ainda vivem no monólito `bunzina`, respeitando a separação de responsabilidades da Fase 4 e o Saga Pattern. Use este documento como contexto para a implementação assistida por IA.

## Estado atual

O `bunzina-os` já expõe:

- `POST /service-orders` — cria uma OS, salva snapshots de cliente/veículo e inicia a saga.
- `GET /service-orders/:id` — consulta por ID.
- `GET /service-orders` — lista com paginação e filtros, incluindo `customerId`, `vehicleId`, status e datas.

No monólito (`bunzina/src/api/server.ts`) ainda estão registradas estas rotas:

- `GET /service-orders/customer/:documentNumber`
- `PUT /service-orders/:id`
- `DELETE /service-orders/:id`
- `PATCH /service-orders/:id/status`
- `PATCH /service-orders/services/:id/complete`
- `POST /service-orders/:id/quote/confirm`

## Responsabilidade por operação

### Migrar ou definir no `bunzina-os`

1. **Busca por documento do cliente** — `GET /service-orders/customer/:documentNumber`. A listagem atual aceita `customerId`, então falta avaliar como manter a busca por documento sem acessar diretamente o banco do serviço de Cadastros. Considere o cliente REST já existente e os snapshots persistidos na OS; preserve autenticação, filtros e formato de resposta compatíveis com o contrato atual.
2. **Alteração da OS** — `PUT /service-orders/:id`. Defina quais campos podem mudar e em quais estados. Não altere silenciosamente dados históricos ou snapshots que a saga já está usando.
3. **Remoção da OS** — `DELETE /service-orders/:id`. Defina as regras por estado; não remova uma ordem com saga ou pagamento em andamento sem tratar consistência e compensação.
4. **Status e entrega** — `PATCH /service-orders/:id/status`. O domínio antigo tem `DELIVERED`; o `bunzina-os` também declara esse status, mas não expõe hoje uma operação de entrega. Não replique uma alteração genérica que permita ao cliente pular estados controlados pela saga. Defina e implemente a transição de entrega válida (por exemplo, após `COMPLETED`), com validação de estado e persistência.

### Manter no serviço dono do fluxo

- **Conclusão de serviço/reparo** — `PATCH /service-orders/services/:id/complete` pertence ao Workshop. Já existe uma operação correspondente em `PATCH /executions/:serviceOrderId/items`. Não recrie essa regra no `bunzina-os`; verifique compatibilidade e atualize consumidores/collection se necessário.
- **Aprovação/recusa de orçamento** — `POST /service-orders/:id/quote/confirm` deve ser substituída por uma operação do Billing, que publica o evento correspondente para o orquestrador. O Billing atualmente consulta orçamentos por `GET /quotes/:id` e emite e-mail, mas ainda precisa da ação de aprovação/recusa e dos eventos. Não coloque a regra de orçamento no OS.

## Instruções de implementação

1. Antes de editar, leia as rotas, handlers, schemas, casos de uso, entidades, repositórios, migrations e testes nos dois repositórios. Confira também o contrato de eventos em `bunzina/docs/contracts/events-saga-contracts.md` e a documentação da saga no `bunzina-os/docs/saga-orchestration.md`.
2. Implemente as operações de responsabilidade do OS nas camadas atuais do `bunzina-os` (rota, validação, caso de uso, domínio e repositório), sem acesso direto ao banco de outro serviço.
3. Preserve as convenções existentes de autenticação, erros HTTP, validação, OpenAPI/Swagger, paginação e apresentação de respostas. Documente qualquer mudança incompatível.
4. Proteja as transições da saga contra alterações manuais que possam contradizer eventos já recebidos, pagamentos ou execução. Prefira regras explícitas por estado e transações no banco.
5. Adicione ou ajuste testes unitários/BDD para sucesso, validação, not-found, estados não permitidos e interações com dependências. Atualize a collection Bruno e os READMEs afetados.
6. No monólito, remova ou encaminhe as rotas antigas somente quando a nova operação estiver disponível e a compatibilidade estiver definida. Não deixe duas implementações divergentes da mesma regra.
7. Ao concluir, informe arquivos alterados, decisões de domínio, rotas migradas, rotas redirecionadas a Billing/Workshop, testes executados e pendências externas (por exemplo, proteção de branch ou deploy).

## Critérios de aceite

- As quatro operações destinadas ao OS acima têm comportamento documentado e coberto por testes; busca por documento, alteração, remoção e entrega não ficam sem destino.
- Nenhuma operação do OS lê diretamente o banco de Cadastros, Billing ou Workshop.
- A saga continua sendo a autoridade para estados de diagnóstico, orçamento, pagamento e execução; a entrega tem uma transição explícita após a conclusão.
- A conclusão de execução permanece no Workshop e a aprovação/recusa do orçamento permanece no Billing.
- Swagger e exemplos de API refletem as rotas finais, sem manter endpoints legados apontando para regras removidas.
- As migrations são compatíveis com os dados atuais e a remoção/alteração de OS não quebra histórico nem consistência da saga.
