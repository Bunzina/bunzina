# Tasks — Fase 4 do Tech Challenge

O objetivo declarado no PDF da Fase 4 é refatorar a aplicação para uma arquitetura de
microsserviços com gestão transacional distribuída e automação completa de build, testes
e deploy. O Tech Challenge vale 90% da nota de todas as disciplinas da fase.

O PDF não informa data de entrega nem rubrica de pontuação por item. O prazo está no
Portal do Aluno.

---

# Decisões arquiteturais

Estas decisões precisam ser fechadas antes de qualquer código, porque bloqueiam todas as
etapas seguintes. Cada uma delas vira um ADR em `docs/adrs/`.

- [x] Decidir o recorte dos microsserviços. → [ADR 0012](arch/adrs/0012-microservices-split.md)
  - A proposta é manter o `bunzina` atual como serviço de Cadastros e Autenticação
    (`customer`, `vehicle`, `user`, `service`, `auto-part`, `notification`) com o Postgres
    que já existe.
  - Extrair três repositórios novos: `bunzina-os` (ciclo de vida e histórico da ordem de
    serviço), `bunzina-billing` (orçamento e pagamento) e `bunzina-workshop` (fila de
    execução, diagnóstico e reparos).
  - Essa divisão preserva a maior parte do código e dos testes já escritos, que são o
    ativo mais caro do projeto.
  - A alternativa de dissolver o monólito em quatro ou cinco serviços multiplica o
    trabalho sem ganhar ponto no enunciado, que exige no mínimo três.
  - A alternativa de criar três serviços finos que continuam lendo o Postgres do monólito
    viola o requisito de banco próprio por serviço e esvazia a saga.

- [x] Decidir a estratégia do Saga Pattern. → [ADR 0013](arch/adrs/0013-orchestrated-saga.md)
  - A proposta é saga orquestrada, com o `bunzina-os` como orquestrador.
  - O estado da saga fica persistido em uma tabela `saga_instances`, com o id da ordem de
    serviço como correlation id.
  - O orquestrador publica comandos e consome respostas dos demais serviços; em caso de
    falha, emite os comandos de compensação.
  - A máquina de estados que já existe em
    `src/domain/service-order/state-machines/status-machine.ts` vira a espinha da saga.
  - A justificativa da escolha entre orquestração e coreografia é exigida explicitamente
    no README pelo PDF, não apenas no documento do portal.
  - A orquestração foi preferida porque o vídeo precisa demonstrar a execução da saga e o
    tratamento de falhas, e apontar para uma tabela de estado e um log de compensação é
    mais demonstrável do que narrar um fluxo de eventos espalhado.

- [x] Decidir onde entra o banco não relacional. → [ADR 0014](arch/adrs/0014-mongodb-workshop.md)
  - A proposta é MongoDB no `bunzina-workshop`, guardando a fila de execução e o log de
    eventos de diagnóstico e reparo.
  - Esse é o único serviço cujo dado é genuinamente semiestruturado: checklists variáveis
    por tipo de serviço, anotações do mecânico e evidências.
  - Com isso a justificativa técnica exigida pelo PDF fica natural, em vez de decorativa.
  - Caso a cota do AWS Academy não comporte mais um StatefulSet, a alternativa é DynamoDB
    gerenciado, que consome menos nós.

- [x] Decidir o broker de mensageria. → [ADR 0015](arch/adrs/0015-rabbitmq-broker.md)
  - A proposta é RabbitMQ no cluster, via Helm, com exchange topic, filas por serviço e
    dead letter queue.
  - O fator decisivo é a paridade entre desenvolvimento e produção: o mesmo broker roda no
    `docker-compose` local, o que permite ensaiar a falha e a compensação antes de gravar
    o vídeo.
  - A alternativa SQS e SNS elimina a operação do broker, mas não tem paridade local sem
    LocalStack ou ElasticMQ.
  - Kafka foi descartado por ser desproporcional ao tamanho do cluster e ao prazo.

- [x] Decidir a estratégia de reuso de código entre os serviços. → [ADR 0016](arch/adrs/0016-code-reuse-between-services.md)
  - A proposta é copiar as camadas transversais para cada repositório e deixá-las divergir
    livremente, já que repositórios separados são exigência do enunciado.
  - A exceção é o setup de OpenTelemetry com propagação de contexto pelo broker, que vale
    virar pacote, porque é o trecho mais sutil e precisa ser idêntico nos quatro serviços
    para o trace distribuído aparecer no Tempo.
  - O grupo já publica pacotes próprios no npm, então a esteira de publicação existe.

- [x] Decidir a ferramenta de verificação de qualidade. → [ADR 0017](arch/adrs/0017-sonarcloud-quality-gate.md)
  - A proposta é SonarCloud, gratuito para repositórios públicos, e todos os repositórios
    da organização já são públicos.
  - Subir um SonarQube self-hosted apenas para esta entrega é desperdício de esforço.

- [x] Registrar todas as decisões acima como ADRs em `docs/arch/adrs/`.
  - Isso também quita parte da dívida de documentação que ficou aberta na Fase 3.

---

# Contrato de eventos

- [x] Definir o contrato de eventos em um documento único do repositório principal.
  → [Contratos de eventos da saga](contracts/events-saga-contracts.md) e o resumo em
    [events-overview.md](contracts/events-overview.md).
  - Cada evento precisa ter nome, payload, versão e correlation id.
  - O correlation id de todo o fluxo é o id da ordem de serviço.
  - Comandos e eventos do caminho feliz: `evt.os.order-created`,
    `cmd.workshop.start-diagnostic`, `evt.workshop.diagnostic-completed`,
    `cmd.billing.issue-quote`, `evt.billing.quote-issued`, `evt.billing.quote-approved`,
    `cmd.billing.charge`, `evt.billing.payment-confirmed`,
    `cmd.workshop.start-execution`, `evt.workshop.execution-completed`.
  - Eventos de falha e desfecho de negócio: `evt.billing.quote-rejected`,
    `evt.billing.payment-failed`, `evt.workshop.diagnostic-failed`,
    `evt.workshop.execution-failed`.
  - Comandos e eventos de compensação: `cmd.billing.cancel-quote`,
    `evt.billing.quote-canceled`, `cmd.billing.refund`, `evt.billing.payment-refunded`,
    `cmd.workshop.abort`, `evt.workshop.execution-aborted`.
  - O contrato precisa estar fechado antes das etapas de implementação, porque é o que
    permite que `bunzina-billing` e `bunzina-workshop` sejam desenvolvidos em paralelo.

- [x] Definir a estratégia de idempotência no consumo de eventos.
  - Cada serviço mantém uma tabela ou coleção `processed_events` para descartar
    reprocessamento.

---

# Higiene do repositório atual

Estes itens são pequenos, mas bloqueiam a evidência de cobertura exigida pelo PDF.

- [x] Ligar a cobertura no `bunfig.ci.toml`.
  - O arquivo tinha `coverage = false`; agora a cobertura está habilitada e o workflow
    executa esse config com `bun test --config=./bunfig.ci.toml`.
  - A Fase 4 exige cobertura mínima de 80% por serviço com evidência, então o gate precisa
    estar ativo no CI de todos os repositórios.
  - O config mantém threshold de 80%; os resultados devem ser conferidos por serviço e
    não registrados aqui como percentuais fixos.

- [x] Limpar a pasta `coverage/`.
  - Existem cerca de duzentos arquivos `.lcov.info.*.tmp` soltos no repositório.
  - O `lcov.info` consolidado está inconsistente, com contagem de branches zerada em
    algumas seções.
  - A pasta já estava no `.gitignore`; nada disso tinha vazado para o repositório.

---

# Infraestrutura compartilhada

- [x] Provisionar o RabbitMQ no cluster.
  - A infraestrutura como código está em [`bunzina-broker`](https://github.com/Bunzina/bunzina-broker): Terraform instala o chart Helm próprio, com exchange topic, filas e DLQs. O apply é manual; confirmar que foi executado no cluster ao preparar o ambiente AWS.
  - Exchange topic, filas por serviço e dead letter queues estão definidos em `bunzina-broker/charts/rabbitmq/values.yaml`.
  - O `docker-compose.yml` local usa a mesma imagem RabbitMQ; validar deploy e conectividade ao preparar o ambiente AWS.

- [x] Criar o cluster MongoDB Atlas M0 do `bunzina-workshop`.
  - Tier gratuito, conforme [ADR 0014](arch/adrs/0014-mongodb-workshop.md).
  - Criar usuário e connection string, e guardá-la como Secret no cluster.
  - Adicionar o IP de saída dos nós do EKS à allowlist do Atlas.
  - Adicionar um container `mongo` ao `docker-compose.yml` local, para manter a paridade.

- [x] Medir se o ambiente do AWS Academy comporta EKS, Postgres e RabbitMQ
      simultaneamente.
  - O time confirmou que cabe. O banco não relacional já havia saído da cota com a
    decisão pelo Atlas, o que reduziu a medição a um workload novo em vez de dois.
  - O CloudAMQP no plano gratuito continua registrado como alternativa na
    [ADR 0015](arch/adrs/0015-rabbitmq-broker.md), caso a cota aperte mais adiante.

- [x] Criar o template de serviço reaproveitável pelos três repositórios novos.
  - Em [`templates/service/`](../templates/service/README.md), com
    `scripts/init-service.sh` para gerar cada repositório.
  - Dockerfile.
  - `bunfig.ci.toml` com cobertura ligada e threshold de 80%.
  - Workflow de CI/CD derivado do `.github/workflows/deploy-k8s.yml`, que já está maduro e
    cobre build, push no ECR, atualização do kubeconfig e upgrade do Helm.
  - `sonar-project.properties`.
  - Chart Helm parametrizado, a partir de `bunzina-chart/charts/app-chart`.
  - Bootstrap de OpenTelemetry, logger e métricas.

- [x] Implementar a propagação de contexto de trace pelo broker.
  - O publisher injeta o `traceparent` do padrão W3C nos headers da mensagem AMQP e o
    consumer o extrai.
  - Sem isso, o requisito de rastreamento dos fluxos distribuídos exigido no vídeo não se
    sustenta, porque o trace quebra em cada salto assíncrono.
  - Implementado em `bunzina-os`, `bunzina-billing` e `bunzina-workshop`, em `src/infrastructure/messaging/`. Falta validar ponta a ponta com os serviços de verdade no ar; essa validação continua pendente em Observabilidade distribuída.

---

# Microsserviço de Ordem de Serviço (`bunzina-os`)

É o serviço central da entrega, porque hospeda o orquestrador da saga.

- [x] Criar o repositório, proteger a branch `main` e configurar o pipeline de CI/CD.

- [x] Migrar as entidades, value objects, estados e testes de domínio da OS para
  `bunzina-os`.
  - O serviço já implementa criação, consulta por ID e listagem de ordens.

- [x] Criar o banco Postgres próprio do serviço.
  - Migrations incluem `service_orders`, `service_order_items`, `saga_instances`,
    `processed_events` e `outbox_messages`.

- [x] Guardar os dados de cliente e veículo como snapshot desnormalizado na criação da OS.

- [x] Implementar o cliente REST para o serviço de Cadastros, com validação, timeout e retry limitado.

- [x] Implementar o orquestrador da saga, com persistência, comandos/eventos,
  idempotência, outbox, compensações e timeout.
  - Os testes BDD e de mensageria cobrem os cenários locais sem depender de Billing ou
    Workshop em execução.

- [ ] Concluir a transição da OS para o `bunzina-os`.
  - Para depois: migrar as rotas restantes de OS do monólito, incluindo busca por cliente,
    alteração/remoção e entrega, conforme o escopo definido para o serviço; depois remover
    ou ajustar o domínio, as rotas e os testes correspondentes no monólito.
  - Depois de completar o fluxo de pagamento do Billing: validar a integração real entre serviços e o trace ponta a ponta.

---

# Microsserviço de Orçamento e Pagamento (`bunzina-billing`)

Depende do contrato de eventos, não do código do `bunzina-os`, então pode ser desenvolvido
em paralelo.

- [x] Criar o repositório com proteção de branch e pipeline.
  - A `main` exige PR e os checks `lint-format/check`, `test/coverage` e
    `sonar/quality-gate`.

- [x] Criar o banco Postgres próprio do serviço.
  - Tabelas `quotes`, `payments` e `payment_events`, mais `processed_events` e
    `outbox_messages` da mensageria transacional. Diagrama ER em
    [er-billing.md](arch/diagrams/er-billing.md).

- [x] Implementar a geração do orçamento a partir do payload do evento.
  - O Billing consome `cmd.billing.issue-quote`, calcula o total em centavos a partir dos
    itens, grava o orçamento e publica `evt.billing.quote-issued`. A lógica de
    `validate-quote-confirmation` do monólito foi a semente.

- [x] Implementar o envio do orçamento para aprovação.
  - E-mail por SMTP com Nodemailer, copiado do monólito, sem chamada ao `bunzina`.
  - A aprovação e a recusa entram por `POST /quotes/:id/approval` e publicam
    `evt.billing.quote-approved` ou `evt.billing.quote-rejected`.

- [x] Integrar com o Mercado Pago.
  - O Checkout Pro usa a API de Orders, não a de preferências
    ([ADR 0002 do Billing](https://github.com/Bunzina/bunzina-billing/blob/main/docs/adr/0002-checkout-pro-via-orders-api.md)),
    no sandbox, com PIX e cartão.
  - O webhook `POST /webhooks/mercadopago` valida o `x-signature`, consulta o estado na API
    e confirma o pagamento uma única vez.
  - Publica `evt.billing.payment-confirmed` ou `evt.billing.payment-failed` conforme o
    resultado.
  - Implementa a compensação `cmd.billing.refund` / `evt.billing.payment-refunded`, e
    estorna sozinho o pagamento tardio.

- [x] Resolver a exposição pública do webhook.
  - O webhook é exposto pelo ALB público do cluster (Ingress `alb`, `internet-facing`), com o
    endereço em `PUBLIC_BASE_URL`. O túnel fica como plano B só para a gravação, sem mudança
    de código.

---

# Microsserviço de Execução e Produção (`bunzina-workshop`)

Pode ser desenvolvido em paralelo ao `bunzina-billing`.

- [x] Criar o repositório com proteção de branch e pipeline.

- [x] Criar o banco MongoDB próprio do serviço.
  - Coleções `execution_queue` e `execution_logs`.
  - A troca de Postgres por Mongo é local à camada de infraestrutura, porque as interfaces
    de repositório já vivem no domínio.

- [x] Implementar o consumo de `cmd.workshop.start-execution` e a gestão da fila de execução.

- [x] Expor a API REST para o mecânico atualizar diagnóstico e reparo.

- [x] Publicar `evt.workshop.execution-completed` e `evt.workshop.execution-failed`.

- [x] Implementar a compensação `cmd.workshop.abort` / `evt.workshop.execution-aborted`.
  - Remove o item da fila e registra o motivo.

---

# Testes e Qualidade

Esta seção corre sobreposta ao desenvolvimento dos serviços, não depois dele.

- [x] Garantir testes unitários em todos os microsserviços.
  - O padrão atual do repositório, com factories e `bun-mock-extended`, deve ser replicado
    nos serviços novos.

- [x] Implementar ao menos um fluxo completo testado com BDD.
  - Uma feature em Gherkin descrevendo o ciclo de vida de uma ordem de serviço.
  - Precisa cobrir o caminho feliz e também o caminho de falha com compensação.
  - A opção preferida é executar com `@cucumber/cucumber` contra os serviços subidos em
    `docker-compose`, porque é mais fiel ao fluxo completo e melhor de demonstrar no vídeo.
  - A opção alternativa, mais barata, é executar o Gherkin dentro do `bun test` com stubs.
  - O melhor lugar para hospedar é o repositório do `bunzina-os`.
  - A feature Gherkin em `bunzina-os/features/` cobre caminho feliz, falha e compensação; os testes executam a saga com dependências em memória. A integração real entre os serviços segue pendente.

- [ ] Garantir cobertura mínima de 80% por serviço, com gate no CI.

- [ ] Publicar a evidência de cobertura no README de cada repositório.
  - O PDF pede prints ou links como evidência, de forma explícita.

- [ ] Configurar o SonarCloud nos quatro repositórios de aplicação.
  - Adicionar o `sonar-project.properties` e a action de scan.
  - Enviar o `coverage/lcov.info` gerado pelo Bun.
  - Configurar o quality gate como check bloqueante do merge.

- [ ] Configurar a proteção de branch em todos os repositórios novos.
  - Os checks obrigatórios devem incluir testes, lint e quality gate.

---

# Observabilidade distribuída

O PDF exige o reaproveitamento das ferramentas de monitoramento já implementadas na Fase 3,
que hoje são OpenTelemetry, Prometheus, Loki, Tempo e Grafana no cluster.

- [ ] Validar o trace ponta a ponta no Tempo.
  - O trace precisa atravessar tanto as chamadas HTTP quanto as mensagens do RabbitMQ.

- [ ] Criar o dashboard da saga no Grafana.
  - Instâncias por estado.
  - Taxa de compensação.
  - Latência por etapa.
  - Mensagens acumuladas na dead letter queue.
  - Versionar o dashboard no chart de observabilidade, em `bunzina-infra/charts/bunzina-observability/dashboards/`.

- [ ] Configurar alerta para falha no processamento de ordens de serviço.
  - O alerta de Fase 3 já existe para falhas HTTP do monólito. Há também um ConfigMap de alerta para DLQ no Billing, mas o sidecar de alertas está desabilitado no `bunzina-infra`; habilitar/importar a regra e cobrir falhas da saga.

- [ ] Garantir que os quatro serviços exportam métricas e são coletados pelo ServiceMonitor.
  - Os quatro expõem `/metrics` e os charts habilitam ServiceMonitor; falta confirmar os alvos ativos no Prometheus do cluster.

---

# Documentação da Arquitetura

Vários itens desta seção também estavam pendentes na Fase 3. A ideia é fazer o trabalho uma
única vez, já no formato final da Fase 4.

- [ ] Criar o diagrama geral da arquitetura final.
  - Deve mostrar os microsserviços, os bancos de cada um, o broker e a comunicação entre
    eles.
  - É entregável obrigatório do documento do portal.

- [x] Criar os diagramas de sequência da saga.
  - Um para o caminho feliz.
  - Um para o caminho de falha com compensação.
  - Ambos estão em `bunzina-os/docs/saga-orchestration.md`.

- [ ] Documentar os bancos de dados.
  - Justificar a escolha do relacional e do não relacional.
  - Atualizar o diagrama ER do Postgres e documentar o modelo de documentos do Mongo.

- [ ] Escrever o README de cada repositório.
  - Arquitetura do serviço, instruções de execução, link do Swagger e evidência de
    cobertura.
  - No `bunzina-os`, incluir obrigatoriamente a justificativa da estratégia de saga
    escolhida, porque o PDF exige essa justificativa no README.

- [x] Publicar o Swagger de cada serviço.
  - A aplicação já usa `@elysiajs/openapi`, então o padrão se replica.

- [ ] Atualizar a collection de API.
  - O projeto usa Bruno, o que atende ao pedido de Swagger ou collection.
  - A collection precisa cobrir o fluxo distribuído completo, não apenas as rotas de um
    serviço.

---

# Entregável ou Entrega

- [ ] Renovar as credenciais do AWS Academy nos secrets dos quatro repositórios de aplicação e do `bunzina-broker`.
  - As credenciais expiram. Se os workflows de infraestrutura forem executados de novo para preparar o ambiente, atualizar também `bunzina-infra` e `bunzina-db`.

- [ ] Preparar e ensaiar o ambiente na AWS para a gravação.
  - Como nas fases anteriores, os recursos precisam estar ativos apenas durante a gravação.

- [ ] Gravar o vídeo de demonstração com duração máxima de 15 minutos.
  - Pode ser publicado no YouTube ou Vimeo, público ou não listado.
  - O PDF exige demonstrar quatro pontos: o fluxo completo de uma ordem de serviço passando
    pelos microsserviços; a execução do Saga Pattern e o tratamento de falhas; o deploy
    automatizado de pelo menos um microsserviço com validação de testes; e o monitoramento
    e rastreamento dos fluxos distribuídos.
  - Roteiro sugerido: dois minutos de arquitetura, quatro minutos do fluxo feliz, três
    minutos de falha no pagamento com a compensação visível na tabela de saga e na dead
    letter queue, três minutos de pipeline fazendo deploy e três minutos de Grafana e Tempo
    com o trace distribuído.

- [ ] Montar o PDF único para entrega no Portal do Aluno.
  - Nome e identificação dos participantes.
  - Links de todos os repositórios.
  - Link do vídeo.
  - Diagrama geral da arquitetura final com microsserviços, bancos e comunicação.
  - Descrição da estratégia escolhida para o Saga Pattern.
  - Justificativa da divisão dos microsserviços e das tecnologias utilizadas.

- [ ] Destruir os recursos da AWS após a gravação e a validação do vídeo.

---

# Ordem de execução e cortes

A ordem de dependência é: decisões arquiteturais e contrato de eventos, depois a
infraestrutura compartilhada, depois o `bunzina-os` com a saga, depois `bunzina-billing` e
`bunzina-workshop` em paralelo, depois a observabilidade distribuída e por fim a
documentação e a gravação. Testes e qualidade correm junto do desenvolvimento.

Se o prazo apertar, os cortes seguros, nesta ordem:

1. Dashboards adicionais da observabilidade, mantendo apenas o trace distribuído.
2. O BDD com Cucumber contra o `docker-compose` vira BDD dentro do `bun test`.
3. A integração com o Mercado Pago fica restrita à criação da preferência com webhook
   simulado no sandbox.

A compensação da saga não deve ser cortada em nenhuma hipótese, porque é o item mais
avaliado e o único que o vídeo cobra de forma explícita.
