# ✅ Checklist – Tech Challenge Fase 1

## 🎥 1. Vídeo de apresentação

- [ ] Vídeo com até **15 minutos**
- [ ] Demonstração do **sistema funcionando**
- [ ] Explicação da **arquitetura utilizada**
- [ ] Demonstração das **principais APIs**
- [ ] Demonstração do **fluxo de Ordem de Serviço**
- [ ] Explicação da **modelagem DDD**
- [ ] Demonstração dos **testes automatizados**
- [ ] Demonstração do **Docker rodando o projeto**
- [ ] Apresentação da **documentação (DDD + Swagger)**

---

# 📚 2. Documentação DDD

## Event Storming

- [x] Event Storming do fluxo **Criação da Ordem de Serviço**
- [x] Event Storming do fluxo **Acompanhamento da Ordem de Serviço**
- [x] Event Storming do fluxo **Gestão de peças e insumos**

## Diagramas DDD

- [ ] **Bounded Contexts**
- [ ] **Context Map**
- [x] **Agregados**
- [x] **Entidades**
- [x] **Value Objects**
- [x] **Domain Events**
- [ ] **Application Services**

## Linguagem Ubíqua

- [x] Definição da **Linguagem Ubíqua**

---

# 💻 3. Código-fonte

## Repositório

- [ ] Repositório **privado**
- [ ] Acesso concedido para **soat-architecture**

## Estrutura do projeto

- [x] Arquitetura em **camadas**
- [x] Organização clara do código

Estrutura sugerida:

    src
    ├── domain
    ├── application
    ├── infrastructure
    └── api

---

# ⚙️ 4. Funcionalidades obrigatórias

## Ordem de Serviço

- [ ] Criar **Ordem de Serviço**
- [ ] Identificar cliente por **CPF/CNPJ**
- [ ] Cadastro de **veículo**
- [ ] Inclusão de **serviços**
- [ ] Inclusão de **peças**
- [ ] **Orçamento automático**
- [ ] **Envio do orçamento para aprovação**

## Status da Ordem de Serviço

- [ ] Recebida
- [ ] Em diagnóstico
- [ ] Aguardando aprovação
- [ ] Em execução
- [ ] Finalizada
- [ ] Entregue

- [ ] Alteração automática de status
- [ ] API para cliente consultar progresso da OS

---

# 🗂️ 5. Gestão administrativa

## Clientes

- [x] CRUD de clientes

## Veículos

- [ ] CRUD de veículos

## Serviços

- [ ] CRUD de serviços

## Peças e Insumos

- [x] CRUD de peças
- [x] Controle de estoque

## Ordens de Serviço

- [ ] Listagem de OS
- [ ] Detalhamento de OS

## Métricas

- [ ] Monitoramento do **tempo médio de execução dos serviços**

---

# 🔐 6. Segurança

- [x] Implementação de **autenticação JWT**
- [x] Proteção das **APIs administrativas**
- [x] Validação de **CPF/CNPJ**
- [x] Validação de **placa de veículo**

---

# 🧪 7. Testes

- [x] Testes **unitários**
- [x] Testes **de integração**
- [x] Cobertura mínima de **80% nos domínios críticos**

---

# 🐳 8. Docker

- [x] **Dockerfile**
- [x] **docker-compose.yml**
- [x] Aplicação sobe com **um único comando**
- [x] Banco de dados sobe automaticamente

---

# 📖 9. Documentação da API

- [x] **Swagger / OpenAPI**
- [x] Endpoints documentados
- [x] Documentação acessível via endpoint

---

# 📄 10. README.md

- [x] Descrição do projeto
- [x] Objetivo do sistema
- [x] Tecnologias utilizadas
- [x] Justificativa do banco de dados escolhido
- [x] Como rodar com **Docker**
- [x] Como rodar **localmente**
- [x] Como executar **testes**

---

# 🛡️ 11. Relatório de vulnerabilidades

- [x] Scan de segurança no código
- [x] Ferramenta utilizada documentada
- [ ] Vulnerabilidades encontradas
- [ ] Correções aplicadas ou justificativas

---

# 📑 12. Documento final de entrega (PDF)

Deve conter:

- [ ] **Nome do grupo**
- [ ] **Participantes**
- [ ] **Usernames no Discord**
- [ ] **Link da documentação DDD**
- [ ] **Link do repositório**
- [ ] **Relatório de vulnerabilidades**

---

# ⭐ Checklist final antes da entrega

- [x] Sistema roda com `docker-compose up`
- [x] Swagger funcionando
- [x] APIs funcionando
- [x] Testes passando
- [x] Cobertura ≥ **80%**
- [x] Documentação DDD pronta
- [ ] Vídeo gravado
- [ ] PDF final pronto
