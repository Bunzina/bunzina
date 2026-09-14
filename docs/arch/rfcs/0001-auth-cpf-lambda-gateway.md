# RFC 001 - API Gateway e Lambda de Login

## Status

Aceito e implementado.

## Contexto

A Fase 3 do Tech Challenge solicita a criação de uma Function Serverless e o uso
de um API Gateway como porta de entrada para a aplicação.

Para o Bunzina, foi confirmado que o API Gateway desta etapa precisa contemplar
apenas a rota de autenticação:

```http
POST /auth/login
```

As demais rotas continuam sendo atendidas pela aplicação principal executando no
Kubernetes.

O projeto principal `bunzina` já possui a regra de autenticação, validação de
credenciais, consulta ao banco e geração de JWT. Por isso, a Function
Serverless não deve duplicar essa lógica nem acessar o banco diretamente.

## Decisão

Criar um repositório separado chamado `bunzina-lambda`, responsável pela Function
Serverless de login e pelo API Gateway associado a ela.

A Lambda será implementada com Bun e TypeScript, seguindo a mesma direção técnica
do projeto principal. Como a AWS Lambda não oferece Bun como runtime gerenciado
oficial, a Function será empacotada como container image.

O API Gateway expõe somente:

```http
POST /auth/login
```

O fluxo definido é:

```text
Cliente -> API Gateway -> Lambda Auth -> API principal bunzina -> PostgreSQL
```

A Lambda valida o payload de entrada e delega a autenticação para o `bunzina` por
meio de uma chamada HTTP:

```http
POST /auth/login
```

## Escopo Implementado

- Criação do repositório `bunzina-lambda`.
- Implementação da Lambda com Bun e TypeScript.
- Empacotamento da Lambda como container image.
- Provisionamento via Serverless Framework.
- Exposição da rota `POST /auth/login` via API Gateway HTTP API.
- Uso da role `LabRole` do AWS Academy Learner Lab.
- Configuração de deploy via GitHub Actions.
- Build e push da imagem Docker para o Amazon ECR.
- Uso de secrets no GitHub para credenciais AWS e dados de deploy.
- Validação do payload `{ document, password }` com Zod.
- Validação de CPF.
- Chamada externa para a API principal `bunzina` com Axios.
- Repasse da resposta de sucesso do `bunzina`.
- Repasse de erros HTTP retornados pelo `bunzina`.
- Retorno `400` para JSON inválido, CPF inválido ou senha vazia.
- Retorno `502` para erro de rede, timeout ou indisponibilidade da API principal.
- Testes automatizados com `bun test`.
- Documentação do repositório no README.

## Arquitetura Interna

O `bunzina-lambda` segue uma estrutura semelhante à arquitetura do `bunzina`,
separando entrada, caso de uso, serviço externo e resposta HTTP.

Principais componentes:

- Schema de validação para o payload de login.
- Adapter de input para o evento do API Gateway.
- Use case `LoginUseCase`.
- Serviço externo `BunzinaAuthService`.
- Helper de response para padronização de status code e JSON.
- Handler Lambda responsável por montar as dependências.

## Contrato

Request:

```http
POST /auth/login
Content-Type: application/json
```

```json
{
  "document": "11144477735",
  "password": "senha123"
}
```

Response de sucesso:

```json
{
  "token": "..."
}
```

A resposta de sucesso é a mesma retornada pela API principal `bunzina`.

## Ajustes no Bunzina

Para suportar o fluxo da Lambda, a autenticação do projeto principal passou a
aceitar identificação por CPF/documento.

Os pontos revisados no `bunzina` incluem:

- Schema de login.
- Adapter de input.
- Use case de login.
- Repository.
- Mapper.
- Presenter.
- Geração de JWT.
- Testes relacionados ao fluxo de autenticação.
- Migration para garantir o campo `document` em bases existentes.

## CI/CD

O deploy do `bunzina-lambda` é feito por GitHub Actions.

O pipeline executa:

- Instalação de dependências com Bun.
- Testes automatizados.
- Login no Amazon ECR.
- Build da imagem Docker com `--provenance=false`.
- Tag da imagem.
- Push para o ECR.
- Deploy com Serverless Framework.

As variáveis sensíveis ou dependentes da conta AWS são mantidas em GitHub
Secrets:

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SESSION_TOKEN`
- `AWS_ACCOUNT_ID`
- `ECR_REPOSITORY`
- `BUNZINA_API_BASE_URL`

O `ECR_IMAGE_URI` é montado automaticamente no workflow a partir de
`AWS_ACCOUNT_ID`, região e `ECR_REPOSITORY`.

## AWS Academy Learner Lab

Como o ambiente utilizado é o AWS Academy Learner Lab, algumas decisões foram
tomadas para respeitar suas limitações:

- Uso da role `LabRole`.
- Uso de credenciais temporárias.
- Necessidade de atualizar secrets quando o lab reiniciar.
- Uso de recursos simples e compatíveis com o ambiente.
- Deploy preparado para ser recriado quando os recursos forem limpos pelo lab.

## Alternativas Consideradas

### Autenticar direto na Lambda

Essa opção foi descartada porque duplicaria regras de autenticação, consulta de
usuário e geração de JWT. Também aumentaria o acoplamento da Lambda com o banco
de dados.

### Gerar JWT na Lambda

Essa opção foi descartada porque a responsabilidade de autenticação já pertence
à aplicação principal `bunzina`.

### Usar runtime gerenciado Node.js

Essa opção facilitaria o empacotamento da Lambda, mas fugiria do padrão técnico
do projeto, que utiliza Bun.

### Mapear todas as rotas no API Gateway

Essa opção foi descartada para esta etapa porque o escopo confirmado contempla
somente `POST /auth/login`. As demais rotas continuam na aplicação principal.

### Alterar o Helm Chart nesta etapa

Essa opção foi descartada porque o `bunzina-chart` não precisa mudar para
entregar a Lambda de login e o API Gateway mínimo.

## Consequências

### Positivas

- Mantém a autenticação centralizada no `bunzina`.
- Evita acesso direto da Lambda ao banco de dados.
- Reduz duplicação de regras de negócio.
- Permite atender o requisito de Function Serverless.
- Preserva o uso de Bun no ecossistema do projeto.
- Mantém o API Gateway com escopo simples e claro.

### Pontos de atenção

- A Lambda depende da disponibilidade da API principal `bunzina`.
- O endpoint do API Gateway pode mudar se a stack for recriada.
- No AWS Academy Learner Lab, as credenciais são temporárias.
- A imagem Docker precisa ser publicada no ECR antes do deploy.
- O build da imagem deve usar `--provenance=false` para evitar manifesto não
  suportado pela AWS Lambda.

## Fora de Escopo

- Mapear todas as rotas da aplicação no API Gateway.
- Criar autenticação direta contra o banco na Lambda.
- Gerar JWT dentro da Lambda.
- Alterar o `bunzina-chart`.
- Provisionar banco de dados gerenciado.
- Implementar observabilidade da aplicação completa.

## Validação

A implementação foi validada com:

- Testes automatizados no `bunzina-lambda`.
- Build da imagem Docker.
- Push da imagem para o ECR.
- Deploy com Serverless Framework.
- Teste real do endpoint publicado pelo API Gateway.
- Teste de validação com CPF inválido e senha vazia.
- Testes focados no `bunzina` para confirmar o login por documento.

## Referências

- Repositório da Lambda: `bunzina-lambda`
- Aplicação principal: `bunzina`
- Documentação da fase: `docs/tasks-phase-3.md`
- Rota pública implementada: `POST /auth/login`
