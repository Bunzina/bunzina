# Domain Design (DDD)

Sistema integrado de atendimento e execução de serviços para oficina mecânica.

## Bounded Context

Contexto único: **Oficina**

Subdomínios lógicos (para documentação/Event Storming):

- **Atendimento** — cadastro de clientes e veículos
- **Ordem de Serviço** — criação, orçamento, aprovação, execução
- **Estoque** — peças, insumos e controle de quantidade

---

## Linguagem Ubiqua

| Termo                       | Significado                                                                                                    |
| --------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Cliente**                 | Pessoa física (CPF) ou jurídica (CNPJ) que traz o veículo                                                      |
| **Veículo**                 | Automóvel identificado por placa, vinculado a um cliente                                                       |
| **Ordem de Serviço (OS)**   | Registro completo de um atendimento, do recebimento à entrega                                                  |
| **Serviço**                 | Tipo de trabalho oferecido pela oficina (ex: troca de óleo, alinhamento)                                       |
| **Item de Serviço**         | Um serviço específico incluído em uma OS, com preço                                                            |
| **Peça**                    | Produto físico no catálogo da oficina (ex: filtro de óleo)                                                     |
| **Item de Peça**            | Uma peça vinculada a uma OS, com quantidade e preço unitário                                                   |
| **Orçamento**               | Valor total calculado da OS (soma de serviços + peças)                                                         |
| **Aprovação**               | Aceite do cliente para execução do orçamento                                                                   |
| **Status da OS**            | Estágio atual no fluxo: Recebida → Em Diagnóstico → Aguardando Aprovação → Em Execução → Finalizada → Entregue |
| **Movimentação de Estoque** | Registro de entrada ou saída de peças do estoque                                                               |

---

## Entidades, Aggregates e Value Objects

### Value Objects compartilhados

**Dinheiro**

- `valor: number` (em centavos, evita problemas de ponto flutuante)
- `moeda: string` (default "BRL")
- Igualdade por valor. Imutável.

---

### Aggregate 1: Cliente (Aggregate Root)

| Propriedade    | Tipo        | Classificação |
| -------------- | ----------- | ------------- |
| `id`           | UUID        | Identidade    |
| `nome`         | string      | Propriedade   |
| `documento`    | `Documento` | Value Object  |
| `email`        | `Email`     | Value Object  |
| `telefone`     | `Telefone`  | Value Object  |
| `endereco`     | `Endereco`  | Value Object  |
| `criadoEm`     | Date        | Propriedade   |
| `atualizadoEm` | Date        | Propriedade   |

**Value Objects:**

- **Documento** — `valor: string`, `tipo: CPF | CNPJ` (com validação de formato)
- **Email** — `valor: string` (com validação de formato)
- **Telefone** — `valor: string` (com validação/máscara)
- **Endereco** — `logradouro: string`, `numero: string`, `complemento?: string`, `bairro: string`, `cidade: string`, `estado: string`, `cep: string`

---

### Aggregate 2: Veículo (Aggregate Root)

> **Nota de design:** Veículo é modelado como Aggregate Root separado (e não como entidade filha de Cliente) por pragmatismo — simplifica o CRUD e os endpoints REST. A referência `clienteId` é validada na camada de application ao criar/atualizar um veículo.

| Propriedade    | Tipo    | Classificação |
| -------------- | ------- | ------------- |
| `id`           | UUID    | Identidade    |
| `clienteId`    | UUID    | Referência    |
| `placa`        | `Placa` | Value Object  |
| `marca`        | string  | Propriedade   |
| `modelo`       | string  | Propriedade   |
| `ano`          | number  | Propriedade   |
| `criadoEm`     | Date    | Propriedade   |
| `atualizadoEm` | Date    | Propriedade   |

**Value Objects:**

- **Placa** — `valor: string` (validação formato antigo ABC-1234 e Mercosul ABC1D23)

---

### Aggregate 3: Serviço (Aggregate Root)

| Propriedade       | Tipo             | Classificação          |
| ----------------- | ---------------- | ---------------------- |
| `id`              | UUID             | Identidade             |
| `nome`            | string           | Propriedade            |
| `descricao`       | string           | Propriedade            |
| `precoBase`       | `Dinheiro`       | Value Object           |
| `duracaoEstimada` | number (minutos) | Propriedade            |
| `ativo`           | boolean          | Propriedade            |
| `criadoEm`        | Date             | Propriedade (via base) |
| `atualizadoEm`    | Date             | Propriedade (via base) |

---

### Aggregate 4: Peça (Aggregate Root)

| Propriedade           | Tipo       | Classificação                                               |
| --------------------- | ---------- | ----------------------------------------------------------- |
| `id`                  | UUID       | Identidade                                                  |
| `nome`                | string     | Propriedade                                                 |
| `descricao`           | string     | Propriedade                                                 |
| `precoUnitario`       | `Dinheiro` | Value Object                                                |
| `quantidadeEmEstoque` | number     | Propriedade (denormalizado, atualizado a cada movimentação) |
| `quantidadeMinima`    | number     | Propriedade                                                 |
| `ativo`               | boolean    | Propriedade                                                 |
| `criadoEm`            | Date       | Propriedade (via base)                                      |
| `atualizadoEm`        | Date       | Propriedade (via base)                                      |

**Entidade filha:**

**MovimentacaoEstoque:**

| Propriedade        | Tipo                                         |
| ------------------ | -------------------------------------------- |
| `id`               | UUID                                         |
| `pecaId`           | UUID (ref)                                   |
| `tipo`             | `ENTRADA \| SAIDA`                           |
| `quantidade`       | number                                       |
| `ordemDeServicoId` | UUID? (ref, para saídas vinculadas a uma OS) |
| `motivo`           | string                                       |
| `criadoEm`         | Date                                         |

> **Nota de design:** `quantidadeEmEstoque` em Peça é um valor denormalizado, atualizado a cada movimentação. MovimentacaoEstoque é o registro auditável de todas as entradas e saídas.

---

### Aggregate 5: Ordem de Serviço (Aggregate Root)

Este é o coração do domínio.

| Propriedade    | Tipo                         | Classificação            |
| -------------- | ---------------------------- | ------------------------ |
| `id`           | UUID                         | Identidade               |
| `codigo`       | string (ex: OS-20260323-001) | Propriedade              |
| `clienteId`    | UUID                         | Referência               |
| `veiculoId`    | UUID                         | Referência               |
| `status`       | `StatusOS`                   | Value Object (enum)      |
| `itensServico` | `ItemServico[]`              | Entity (filha)           |
| `itensPeca`    | `ItemPeca[]`                 | Entity (filha)           |
| `orcamento`    | `Orcamento`                  | Value Object (calculado) |
| `aprovadoEm`   | Date?                        | Propriedade              |
| `iniciadoEm`   | Date?                        | Propriedade              |
| `finalizadoEm` | Date?                        | Propriedade              |
| `entregueEm`   | Date?                        | Propriedade              |
| `criadoEm`     | Date                         | Propriedade              |
| `atualizadoEm` | Date                         | Propriedade              |

**Entidades filhas:**

**ItemServico:**

| Propriedade | Tipo       |
| ----------- | ---------- |
| `id`        | UUID       |
| `servicoId` | UUID (ref) |
| `descricao` | string     |
| `preco`     | `Dinheiro` |

**ItemPeca:**

| Propriedade     | Tipo                                                |
| --------------- | --------------------------------------------------- |
| `id`            | UUID                                                |
| `pecaId`        | UUID (ref)                                          |
| `descricao`     | string                                              |
| `quantidade`    | number                                              |
| `precoUnitario` | `Dinheiro`                                          |
| `precoTotal`    | `Dinheiro` (calculado: quantidade \* precoUnitario) |

**Value Objects da OS:**

- **StatusOS** — enum: `RECEBIDA`, `EM_DIAGNOSTICO`, `AGUARDANDO_APROVACAO`, `EM_EXECUCAO`, `FINALIZADA`, `ENTREGUE`, `CANCELADA`
- **Orcamento** — `totalServicos: Dinheiro`, `totalPecas: Dinheiro`, `total: Dinheiro` (calculado automaticamente a partir dos itens)

---

### Aggregate 6: Usuário (Aggregate Root — módulo autenticação)

| Propriedade    | Tipo                           | Classificação          |
| -------------- | ------------------------------ | ---------------------- |
| `id`           | UUID                           | Identidade             |
| `nome`         | string                         | Propriedade            |
| `email`        | `Email`                        | Value Object           |
| `senha`        | string (hash bcrypt)           | Propriedade            |
| `papel`        | `ADMIN \| MECANICO \| CLIENTE` | Enum                   |
| `ativo`        | boolean                        | Propriedade            |
| `criadoEm`     | Date                           | Propriedade (via base) |
| `atualizadoEm` | Date                           | Propriedade (via base) |

---

## Máquina de Estados da OS

```
RECEBIDA ──────────────────────────────► CANCELADA
    │                                        ▲
    ▼                                        │
EM_DIAGNOSTICO ─────────────────────────────┤
    │                                        │
    ▼                                        │
AGUARDANDO_APROVACAO ───────────────────────┘
    │
    ├──(cliente aprova)──► EM_EXECUCAO
    │                          │
    │                          ▼
    │                      FINALIZADA
    │                          │
    │                          ▼
    │                       ENTREGUE
    │
    └──(cliente recusa)──► RECEBIDA (mesma OS, novo diagnóstico/orçamento)
```

**Transições válidas:**

| De                     | Para                   | Ação que dispara                                                            |
| ---------------------- | ---------------------- | --------------------------------------------------------------------------- |
| `RECEBIDA`             | `EM_DIAGNOSTICO`       | Mecânico inicia diagnóstico                                                 |
| `RECEBIDA`             | `CANCELADA`            | Cliente ou oficina cancela atendimento                                      |
| `EM_DIAGNOSTICO`       | `AGUARDANDO_APROVACAO` | Orçamento finalizado, enviado ao cliente                                    |
| `EM_DIAGNOSTICO`       | `CANCELADA`            | Cliente ou oficina cancela atendimento                                      |
| `AGUARDANDO_APROVACAO` | `EM_EXECUCAO`          | Cliente aprova orçamento                                                    |
| `AGUARDANDO_APROVACAO` | `RECEBIDA`             | Cliente recusa orçamento (mesma OS retorna ao início para novo diagnóstico) |
| `AGUARDANDO_APROVACAO` | `CANCELADA`            | Cliente ou oficina cancela atendimento                                      |
| `EM_EXECUCAO`          | `FINALIZADA`           | Todos os serviços concluídos                                                |
| `FINALIZADA`           | `ENTREGUE`             | Veículo retirado pelo cliente                                               |

`CANCELADA` e `ENTREGUE` são estados terminais. Qualquer transição fora dessas é inválida e o domínio lança erro.

---

## Domain Events

Eventos emitidos apenas onde há efeito colateral real:

| Evento                     | Emitido quando                             | Efeito                                                                                               |
| -------------------------- | ------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `OrdemDeServicoCriada`     | OS é criada                                | Log/notificação                                                                                      |
| `OrcamentoGerado`          | Diagnóstico concluído, orçamento calculado | Notifica cliente para aprovação                                                                      |
| `OrcamentoAprovado`        | Cliente aprova                             | Deduz peças do estoque imediatamente (cria MovimentacaoEstoque SAIDA)                                |
| `OrcamentoRecusado`        | Cliente recusa                             | Nenhum efeito no estoque (dedução só ocorre na aprovação)                                            |
| `OrdemDeServicoCancelada`  | OS é cancelada                             | Se havia peças deduzidas (OS foi aprovada antes), reverte estoque (cria MovimentacaoEstoque ENTRADA) |
| `OrdemDeServicoFinalizada` | Serviço concluído                          | Registra tempo de execução para métricas                                                             |
| `OrdemDeServicoEntregue`   | Veículo entregue                           | Fecha ciclo da OS                                                                                    |
| `EstoqueBaixo`             | Quantidade de peça fica abaixo do mínimo   | Alerta administrativo                                                                                |

Implementação via `@nestjs/event-emitter` (EventEmitter2) — eventos in-process, sem message broker.

---

## Regras de Negócio

1. **Orçamento é imutável após aprovação** — se o cliente recusar, a mesma OS volta para `RECEBIDA` e um novo ciclo de diagnóstico/orçamento é feito (o orçamento anterior é substituído pelo novo)
2. **Dedução do estoque só ocorre na aprovação** — não há reserva prévia; no momento da aprovação as peças são deduzidas imediatamente via MovimentacaoEstoque
3. **Não é possível aprovar OS se alguma peça não tem estoque suficiente** — validação no momento da aprovação
4. **Tempo de execução** = `finalizadoEm - iniciadoEm` (para métrica de tempo médio)
5. **Código da OS** é gerado automaticamente pelo sistema (não pelo usuário)
6. **Cancelamento reverte estoque** — se uma OS aprovada for cancelada (antes de EM_EXECUCAO), as peças deduzidas são devolvidas ao estoque
7. **Não é possível excluir cliente com OS em andamento** — apenas clientes sem OS ativas podem ser removidos
8. **Peças e Serviços usam soft-delete** — o campo `ativo` controla disponibilidade; itens inativos não podem ser adicionados a novas OS, mas permanecem visíveis em OS históricas

---

## Autenticação e Autorização

### Estratégia de tokens

- **Access Token (JWT):** curta duração (15 minutos), contém `userId`, `email`, `papel`
- **Refresh Token:** longa duração (7 dias), armazenado no banco, rotacionado a cada uso
- Endpoints de login retornam ambos os tokens; refresh endpoint emite novo par

### Controle de acesso por papel (RBAC)

| Recurso                   | ADMIN | MECANICO | CLIENTE           |
| ------------------------- | ----- | -------- | ----------------- |
| CRUD Clientes             | total | leitura  | apenas próprio    |
| CRUD Veículos             | total | leitura  | apenas próprios   |
| CRUD Serviços             | total | leitura  | leitura           |
| CRUD Peças/Estoque        | total | leitura  | ---               |
| Criar OS                  | total | total    | ---               |
| Avançar status OS         | total | total    | ---               |
| Aprovar/Recusar orçamento | total | ---      | apenas própria OS |
| Consultar OS              | total | total    | apenas próprias   |
| Gestão de usuários        | total | ---      | ---               |

### Endpoints públicos (sem JWT)

- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/register` (apenas papel CLIENTE)

---

## Use Cases por Módulo

### Autenticação

- `RegistrarUsuario` — cria conta com papel CLIENTE
- `FazerLogin` — valida credenciais, retorna access + refresh token
- `RenovarToken` — rotaciona refresh token, emite novo access token

### Cliente

- `CriarCliente` — cadastro com validação de CPF/CNPJ único
- `BuscarClientePorId`
- `BuscarClientePorDocumento` — busca por CPF/CNPJ
- `ListarClientes` — com paginação (offset-based)
- `AtualizarCliente`
- `RemoverCliente` — falha se houver OS em andamento

### Veículo

- `CadastrarVeiculo` — valida placa única e clienteId existente
- `BuscarVeiculoPorId`
- `ListarVeiculosPorCliente`
- `AtualizarVeiculo`
- `RemoverVeiculo`

### Serviço

- `CadastrarServico`
- `BuscarServicoPorId`
- `ListarServicos` — com paginação
- `AtualizarServico`
- `DesativarServico` — soft-delete

### Estoque (Peça)

- `CadastrarPeca`
- `BuscarPecaPorId`
- `ListarPecas` — com paginação e filtro por estoque baixo
- `AtualizarPeca`
- `DesativarPeca` — soft-delete
- `RegistrarEntradaEstoque` — cria MovimentacaoEstoque ENTRADA, atualiza quantidade
- `ConsultarMovimentacoes` — histórico de movimentações por peça

### Ordem de Serviço

- `CriarOrdemDeServico` — identifica cliente por documento, vincula veículo, adiciona itens, calcula orçamento
- `BuscarOrdemDeServicoPorId`
- `BuscarOrdensPorCliente`
- `ListarOrdensDeServico` — com paginação e filtro por status
- `IniciarDiagnostico` — RECEBIDA → EM_DIAGNOSTICO
- `FinalizarOrcamento` — EM_DIAGNOSTICO → AGUARDANDO_APROVACAO (recalcula orçamento)
- `AprovarOrcamento` — AGUARDANDO_APROVACAO → EM_EXECUCAO (valida estoque, deduz peças)
- `RecusarOrcamento` — AGUARDANDO_APROVACAO → RECEBIDA
- `FinalizarServico` — EM_EXECUCAO → FINALIZADA
- `EntregarVeiculo` — FINALIZADA → ENTREGUE
- `CancelarOrdemDeServico` — qualquer status pré-execução → CANCELADA
- `ConsultarTempoMedioExecucao` — métrica agregada

### Paginação

Todas as listagens utilizam paginação offset-based: `page` (default 1) e `limit` (default 20, max 100).

---

### Estrutura de diretórios

```
src/
├─ adapters/
│  ├─ input/        # respectivo ao adapter de input
│  └─ output/         # camada de apresentação tipo toHttp
│
├─ api/
│  └─ handlers/           # ponto de entrada do endpoint
│
├─ application/
│  └─ use-cases/          # casos de uso
│
├─ domain/                # entidades e interfaces de repositorio
│
├─ infrastructure/
│  ├─ repositories/           # respectivo aos repositories
│  ├─ services/           # respectivo aos services
│  └─ configs/            # configurações externas ao codigo
│     ├─ env/             # variáveis de ambiente
│     └─ postgres/        # banco de dados
│
├─ test/                  # helpers testes
│
└─ types/                 # tipos para config
```

### Fluxo de dependência

```
presentation → application → domain
                    ↓
              infrastructure
```

- **domain/** não depende de nada externo (puro TypeScript)
- **application/** orquestra use cases, depende de interfaces definidas no domain
- **infrastructure/** implementa as interfaces (Prisma repositories)
- **presentation/** recebe HTTP, valida DTOs, chama application

---

## Módulos e responsabilidades

| Módulo             | Aggregate Root | Entidades filhas      | VOs principais                       |
| ------------------ | -------------- | --------------------- | ------------------------------------ |
| `cliente`          | Cliente        | —                     | Documento, Email, Telefone, Endereco |
| `veiculo`          | Veículo        | —                     | Placa                                |
| `servico`          | Serviço        | —                     | Dinheiro                             |
| `estoque`          | Peça           | MovimentacaoEstoque   | Dinheiro                             |
| `ordem-de-servico` | OrdemDeServico | ItemServico, ItemPeca | StatusOS, Orcamento, Dinheiro        |
| `autenticacao`     | Usuario        | —                     | Email                                |
