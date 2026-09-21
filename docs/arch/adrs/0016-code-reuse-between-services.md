# ADR 0016 — Reuso de código entre os microsserviços

- Status: Aceita
- Data: Fase 4

## Contexto

Os quatro serviços da [ADR 0012](./0012-microservices-split.md) vivem em repositórios
separados, por exigência do enunciado. Eles compartilham camadas transversais: logger,
configuração, tratamento de erro, helpers de validação, bootstrap do Elysia e setup de
OpenTelemetry.

## Decisão

Copiar as camadas transversais para cada repositório e deixá-las divergir livremente.

A exceção é o **setup de OpenTelemetry com propagação de contexto pelo broker**, que vira
pacote publicado no npm e é consumido pelos quatro serviços.

## Motivo

- Com repositórios separados, um pacote compartilhado por camada transformaria qualquer
  ajuste de logger em ciclo de publicar, versionar e atualizar quatro dependências.
- Divergência em código transversal é barata quando os serviços são pequenos e têm
  ciclos de vida independentes.
- A propagação de trace é a exceção porque é o trecho mais sutil e precisa ser
  **idêntica** nos quatro serviços para o trace distribuído aparecer no Tempo. Uma cópia
  que divergiu quebra o rastreamento sem quebrar teste nenhum.
- O grupo já publica pacotes próprios no npm, então a esteira de publicação existe.

## Consequências

- Correção de bug em código copiado precisa ser aplicada quatro vezes, ou conscientemente
  não ser.
- O pacote de OpenTelemetry vira dependência de release dos quatro serviços e precisa de
  versionamento próprio.
- Cada repositório fica autocontido: clonar e rodar não depende de outro repo do grupo,
  além do pacote npm e do `bunzina-chart`.

## Alternativas

- **Monorepo com workspaces** — resolveria o reuso de verdade, mas contraria a exigência
  de repositórios separados por microsserviço.
- **Pacote npm por camada transversal** — o custo de coordenação não se paga no prazo
  desta entrega.
