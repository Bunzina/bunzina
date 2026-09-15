# Bunzina API — Bruno e cURL

Coleção com 42 requisições: todas as rotas de `src/api/server.ts`, incluindo saúde, métricas, documentação e uma variante de cadastro de usuário interno.

## Abrir no Bruno

1. Em **Open Collection**, selecione esta pasta (`bruno`, que contém `bruno.json`).
2. Selecione o ambiente **Local**. Ajuste `baseUrl` se a API não estiver em `http://localhost:3000`.
3. Preencha `loginDocument` e `loginPassword` com as credenciais de um usuário existente. O documento inicial corresponde ao administrador da migration 014; a senha foi deixada vazia.
4. Execute **02-autenticacao / Login**. O script salva `token` em memória para as requisições protegidas.
5. Execute as requisições desejadas individualmente.

Sem usuário existente, execute **03-usuarios / Criar cliente publico** e use `userDocument` e `userPassword` no login. O cadastro público cria um usuário CUSTOMER; o cadastro de cliente da oficina é uma operação separada. Para cadastrar MECHANIC ou ADMIN, use **Criar usuario interno**, com JWT e documento/email únicos.

## Variáveis e ordem de uso

- Crie cliente → veículo → serviço e peça → ordem de serviço. As respostas salvam `customerId`, `vehicleId`, `serviceId`, `autoPartId` e `serviceOrderId` em memória.
- `userId` é preenchido ao criar usuário. As buscas de cliente, veículo, serviço e peça também capturam o ID.
- Criar, buscar ou atualizar uma ordem salva o primeiro `serviceItems[0].id` em `serviceOrderItemId`. Para concluir outro item, altere essa variável ou o parâmetro da requisição. Esse ID difere do `serviceId` do catálogo.
- É possível preencher IDs existentes no ambiente. Valores capturados pelos scripts têm prioridade durante a sessão.
- Os documentos de exemplo são dados de teste. Ajuste documentos, emails e placa ao repetir cadastros para evitar conflitos.
- Listagens incluem `page` e `limit`. Os filtros opcionais aparecem desmarcados na aba **Params**.
- As rotas protegidas usam Bearer JWT. O middleware também aceita `Api-Key`, mas o cadastro de usuários internos exige JWT.

## Fluxo de ordem de serviço

1. Crie a ordem com cliente, veículo e itens existentes.
2. Execute **Avancar status** para passar de RECEIVED a IN_DIAGNOSTIC e depois a AWAITING_APPROVAL. A segunda transição envia o orçamento pelo provedor de email configurado.
3. Execute **Confirmar orcamento** com o documento do cliente. `isConfirmed: false` rejeita o orçamento.
4. Em IN_EXECUTION, execute **Concluir item de servico** para cada item de serviço.
5. Avance para COMPLETED e depois DELIVERED.

A coleção é um catálogo de operações para execução manual: inclui exclusões, variantes de cadastro e operações que dependem do estado atual da ordem. Não representa uma sequência para executar inteira no Collection Runner.

## Comandos cURL

[curl.md](curl.md) contém o comando equivalente de cada requisição para **Import → cURL**. Selecione o ambiente Local após importar. Os comandos usam placeholders do Bruno (`{{baseUrl}}`, `{{token}}` etc.); substitua-os pelos valores reais antes de executar em um terminal. A importação cURL não inclui os scripts de captura automática presentes nos arquivos `.bru`.

Formato e scripts seguem a [documentação do Bruno](https://docs.usebruno.com/bru-lang/overview) e a [referência de scripts](https://docs.usebruno.com/testing/script/javascript-reference).
