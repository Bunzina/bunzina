# ADR 0012 — Recorte dos microsserviços da Fase 4

- Status: Aceita
- Data: Fase 4

## Contexto

O PDF da Fase 4 exige refatorar o monólito em, no mínimo, três microsserviços com
banco próprio cada um e comunicação por mensageria. O `bunzina` atual concentra
cadastros, autenticação, ordem de serviço, orçamento e notificação sobre um único
PostgreSQL.

O ativo mais caro do projeto é a suíte de testes já escrita sobre o domínio de ordem
de serviço. Qualquer recorte que a jogue fora custa o prazo da entrega.

## Decisão

Quatro serviços, em repositórios separados:

| Repositório | Responsabilidade | Banco |
| --- | --- | --- |
| `bunzina` | Cadastros e autenticação: `customer`, `vehicle`, `user`, `service`, `auto-part`, `notification` | PostgreSQL atual |
| `bunzina-os` | Ciclo de vida e histórico da ordem de serviço; orquestrador da saga | PostgreSQL próprio |
| `bunzina-billing` | Orçamento, aprovação e pagamento | PostgreSQL próprio |
| `bunzina-workshop` | Fila de execução, diagnóstico e reparo | MongoDB ([ADR 0014](./0014-mongodb-workshop.md)) |

O domínio de ordem de serviço sai do `bunzina` junto com seus testes. Nenhum serviço
acessa o banco de outro.

## Motivo

- Preserva a maior parte do código e dos testes existentes: a migração do domínio de
  ordem de serviço é movimentação de arquivos, não reescrita.
- O recorte segue as fronteiras que o domínio já tinha: o cadastro é consultado, a OS
  coordena, o orçamento cobra e a oficina executa.
- Cada serviço tem uma razão de mudança distinta, o que justifica bancos separados sem
  argumento artificial.

## Consequências

- Cliente e veículo viram snapshot desnormalizado no `bunzina-os`, copiados no momento
  da criação da OS. Isso evita chamada síncrona no caminho crítico.
- A validação de cliente, veículo e serviço na criação da OS é uma chamada REST ao
  `bunzina`, com timeout e retry. É a única comunicação síncrona prevista.
- Quatro repositórios de aplicação passam a exigir credencial da AWS, pipeline,
  proteção de branch e quality gate próprios.
- O `bunzina` perde rotas e testes de ordem de serviço, que precisam ser removidos.

## Alternativas

- **Dissolver o monólito em cinco ou mais serviços** — multiplica pipeline, banco e
  documentação sem ganhar ponto: o enunciado pede no mínimo três.
- **Três serviços finos lendo o PostgreSQL do monólito** — viola o requisito de banco
  próprio por serviço e esvazia a saga, que passaria a coordenar escritas no mesmo
  banco.
