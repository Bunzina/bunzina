# Tasks — Fase 3 do Tech Challenge

# Autenticação e API Gateway
- [ ] Implementar um API Gateway.
  - O PDF permite utilizar AWS API Gateway, Kong, Traefik ou outra solução equivalente.
- [ ] Proteger as rotas sensíveis da aplicação com autenticação via CPF.
- [ ] Criar uma Function Serverless para autenticação.
  - Não precisa implementar as três responsabilidades na mesma Function Serverless.
  - Pode ser implementada apenas uma das responsabilidades na Function Serverless.
  - As outras responsabilidades precisam estar implementadas em algum lugar, podendo ficar no pod da aplicação ou em outra Lambda.
  - As responsabilidades apresentadas no requisito são:
    - Validar o CPF do cliente;
    - Consultar a existência e o status do cliente na base de dados;
    - Gerar e devolver um JWT válido para consumo das APIs protegidas.
- [ ] Definir como será implementado o fluxo de autenticação e API Gateway.
  - Estamos aguardando o professor responder uma dúvida no canal do Discord para realmente iniciarmos essa implementação.
---

# Estrutura de Repositórios e CI/CD
- [ ] Organizar o projeto em quatro repositórios separados.
  - Os quatro repositórios precisam possuir CI/CD.
  - Os repositórios necessários são:
    1. Lambda;
    2. Infraestrutura Kubernetes;
    3. Infraestrutura do banco de dados gerenciado;
    4. Aplicação principal executando no Kubernetes.
  - Podemos continuar utilizando o repositório `bunzina-chart` para o Helm Chart.
- [ ] Criar o repositório da Lambda.
  - Esse repositório precisa conter o código da Lambda.
  - Conforme o PDF, esse repositório representa a Function Serverless.
  - O deploy para a Lambda pode ser realizado utilizando Terraform ou Serverless Framework.
  - O API Gateway pode ficar no repositório da Lambda ou no repositório de infraestrutura Kubernetes.
- [ ] Criar o repositório de infraestrutura Kubernetes.
- [ ] Criar o repositório de infraestrutura do banco de dados gerenciado.
  - As migrations podem ficar no repositório da infraestrutura do banco ou no repositório da aplicação.
  - Podemos continuar mantendo as migrations no repositório da aplicação, como já ocorre atualmente.
- [ ] Manter e adaptar o repositório da aplicação principal.
- [ ] Implementar CI/CD nos quatro repositórios.
  - O PDF permite utilizar GitHub Actions, GitLab CI ou outra ferramenta equivalente.
  - O deploy deve ser automático para a nuvem.
- [ ] Configurar proteção da branch principal e uso de Pull Requests.
  - O PDF exige que a branch `main` ou `master` seja protegida, sem commits diretos.
  - O uso de Pull Requests para merge é obrigatório.
  - O PDF menciona deploy automático para homologação e produção, mas, conforme explicado pelo professor, não precisa criar ambiente nem branch de homologação.
  - Não precisa criar ambiente de homologação.
  - Não precisa criar branch de homologação.
---

# Infraestrutura obrigatória
- [ ] Provisionar um API Gateway.
- [ ] Provisionar a Function Serverless.
- [ ] Provisionar um banco de dados gerenciado.
  - O PDF permite a escolha entre PostgreSQL, MySQL, SQL Server ou outro banco gerenciado equivalente.
- [ ] Provisionar um cluster Kubernetes com escalabilidade.
  - A escolha da nuvem é livre, conforme o PDF.
- [ ] Provisionar a infraestrutura utilizando Terraform.
  - Os repositórios sugeridos pelo professor utilizam AWS Academy:
    - `https://github.com/dougls/terraform-academy`
    - `https://github.com/dougls/terraform-soat`
    - `https://github.com/dougls/opentelemetry`
- [ ] Preparar o ambiente de produção para a demonstração.
  - A aplicação não precisa permanecer rodando em produção.
  - Os recursos precisam estar ativos apenas durante a gravação do vídeo.
  - Depois da gravação, podemos destruir os recursos.
  - O professor não irá acessar o ambiente de produção, a observabilidade ou o banco.
  - Após a gravação, podemos destruir tudo que foi criado na AWS.
---

# Monitoramento e Observabilidade
- [ ] Integrar a aplicação com uma ferramenta de monitoramento e observabilidade.
  - O PDF permite escolher livremente uma ferramenta, citando Datadog e New Relic como exemplos.
  - O professor sugeriu o New Relic porque ele possui uma cota gratuita de uso, em vez de um período gratuito limitado como o Datadog.
  - O New Relic possui versão para estudantes.
- [ ] Monitorar a latência das APIs.
- [ ] Monitorar o consumo de CPU e memória do Kubernetes.
- [ ] Monitorar healthchecks e uptime.
- [ ] Implementar alertas para falhas no processamento de ordens de serviço.
  - Podemos criar alertas referentes às APIs de ordem de serviço.
- [ ] Implementar logs estruturados em JSON com correlação entre requisições.
  - A ideia é utilizar um `requestId` para identificar que determinados logs pertencem à mesma requisição.
  - Segundo o professor, essa correlação já é nativa em ferramentas como New Relic e Datadog.
- [ ] Criar o dashboard de volume diário de ordens de serviço.
- [ ] Criar o dashboard de tempo médio de execução por status.
  - Precisamos avaliar como esse cálculo será realizado.
  - Uma possibilidade é criar uma API que receba o status e retorne o tempo médio considerando todas as ordens de serviço.
  - Outra possibilidade é utilizar o New Relic para identificar o timestamp do último log de um status e o timestamp da próxima mudança de status, calcular a diferença e gerar uma média.
  - Outra possibilidade é calcular e registrar o tempo diretamente no código durante a mudança de status.
  - Exemplo: ao alterar o status de `IN_EXECUTION` para `COMPLETED`, calcular o tempo utilizando o horário atual menos o último `updated_at`.
  - Esse tempo pode ser enviado em um log para o New Relic.
  - No New Relic, podemos calcular a média de todos os tempos registrados para cada status.
  - Nesse último caso, podemos utilizar uma série temporal para armazenar e visualizar os dados.
- [ ] Criar o dashboard de erros e falhas nas integrações.
- [ ] Configurar dashboards e alertas na plataforma escolhida.
  - Os dashboards e alertas podem ser configurados manualmente no console da plataforma.
  - No New Relic existe uma opção para exportar os gráficos e depois importá-los novamente, evitando a configuração manual toda vez.
---

# Documentação da Arquitetura
- [ ] Centralizar a documentação da arquitetura no repositório da aplicação.
  - Toda a documentação pode ficar centralizada em uma pasta específica no repositório principal.
- [ ] Criar os diagramas de arquitetura.
  - Podemos utilizar como referência:
    - `https://docs.aws.amazon.com/images/solutions/latest/workload-discovery-on-aws/images/workload-discovery-arch-diagram.png`
  - A ideia é indicar claramente qual componente chama cada serviço.
  - Podemos criar um diagrama para API Gateway e Lambda.
  - Podemos criar outro diagrama para o EKS.
  - Podemos mostrar apenas os componentes da nuvem.
- [ ] Criar os diagramas de sequência.
  - Podemos criar diagramas UML contendo os atores.
  - Precisamos criar um diagrama para o fluxo de autenticação.
  - Precisamos criar um diagrama para o fluxo de abertura da ordem de serviço.
- [ ] Criar RFCs.
  - As RFCs devem registrar decisões técnicas tomadas pelo grupo e o motivo de cada decisão.
- [ ] Criar ADRs.
  - Os ADRs devem registrar decisões arquiteturais tomadas pelo grupo e o motivo de cada decisão.
  - Devemos explicar, por exemplo, por que utilizamos determinados valores de escalabilidade.
- [ ] Documentar o banco de dados.
  - Devemos justificar a escolha do banco.
  - Devemos documentar os ajustes nas tabelas relacionais.
  - Devemos criar ou atualizar o diagrama ER.
  - Devemos explicar os relacionamentos entre as tabelas.
---

# Ajustes pendentes da Fase 2 - Menos prioritário
- [ ] Melhorar a documentação sobre os testes.
  - A documentação atual sobre os testes não está tão clara quanto poderia.
  - Devemos explicar melhor quais tipos de testes existem no projeto e o objetivo de cada um.
- [ ] Detalhar a seção de testes no README.
  - Incluir os comandos necessários para executar os testes.
  - Incluir exemplos de execução dos testes de integração.
  - Explicar eventuais pré-requisitos para os testes, como banco de dados, variáveis de ambiente ou serviços auxiliares.
  - Informar como interpretar o resultado da execução dos testes.
- [ ] Documentar a configuração do ambiente de desenvolvimento.
  - Ensinar como instalar as ferramentas e dependências necessárias para executar o projeto.
  - Incluir instruções de instalação do Node.js ou do runtime utilizado pela aplicação.
  - Incluir instruções de instalação do Docker e Docker Compose.
  - Incluir outras ferramentas necessárias, como Git, Bun e clientes de banco de dados, quando aplicável.
  - Informar as versões recomendadas ou mínimas de cada ferramenta.
  - Explicar como confirmar se cada instalação foi realizada corretamente, utilizando comandos como `node --version`, `docker --version` e `docker compose version`.
  - Explicar como clonar o repositório.
  - Explicar como instalar as dependências do projeto.
  - Explicar como criar e configurar o arquivo de variáveis de ambiente.
  - Explicar como iniciar os serviços necessários, como aplicação e banco de dados.
  - Explicar como executar migrations e preparar o banco local.
  - Explicar como validar que a aplicação foi iniciada corretamente.
  - O objetivo é permitir que um novo desenvolvedor consiga preparar o ambiente e executar o projeto seguindo apenas o README.
---

# Entregável ou Entrega
- [ ] Atualizar o README dos quatro repositórios.
  - O PDF solicita um diagrama específico em cada repositório, mas não precisamos repetir os diagramas.
  - Podemos manter os diagramas no repositório principal e referenciá-los nos READMEs dos outros repositórios.
  - Para o link do Swagger, podemos informar que ele estará disponível ao executar a aplicação localmente.
- [ ] Adicionar Dockerfiles quando aplicável.
  - O próprio PDF indica que os Dockerfiles são obrigatórios apenas quando forem aplicáveis ao repositório.
- [ ] Adicionar pipelines de CI/CD funcionais nos quatro repositórios.
- [ ] Preparar os links dos repositórios e das documentações.
  - O PDF solicita links para os deploys ativos apenas quando aplicável.
  - Não precisamos disponibilizar links para deploys ativos, pois o ambiente de produção será desligado depois da gravação.
- [ ] Gravar o vídeo de demonstração com duração máxima de 15 minutos.
  - O PDF permite publicar o vídeo no YouTube ou Vimeo.
  - O vídeo pode ser público ou não listado.
  - Deve demonstrar autenticação com CPF, pipeline de CI/CD, deploy automatizado, consumo das APIs protegidas, dashboard de monitoramento, logs e traces em execução.
- [ ] Criar o PDF único para entrega no Portal do Aluno.
  - Segundo o PDF, o documento deve reunir os links dos quatro repositórios, do vídeo e das documentações.
  - Não é necessária a confirmação do usuário `soat-architecture`, pois os repositórios são públicos.
- [ ] Destruir os recursos da AWS após a gravação e validação do vídeo.
