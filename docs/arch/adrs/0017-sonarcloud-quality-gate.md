# ADR 0017 — SonarCloud como quality gate

- Status: Aceita
- Data: Fase 4

## Contexto

O PDF da Fase 4 exige verificação de qualidade de código e cobertura mínima de 80% por
serviço, com evidência. A proteção de branch precisa exigir Pull Request e checagens
automáticas em todos os repositórios.

Hoje o `bunfig.ci.toml` do `bunzina` tem `coverage = false`, e o CI roda com
`--config=./bunfig.ci.toml`: na prática não existe gate de cobertura, apesar do threshold
configurado no `bunfig.toml` local.

## Decisão

SonarCloud nos quatro repositórios de aplicação.

- `sonar-project.properties` e action de scan em cada repositório.
- O `coverage/lcov.info` gerado pelo Bun é enviado ao Sonar.
- Quality gate configurado como check bloqueante do merge, junto de testes e lint.
- `bunfig.ci.toml` com `coverage = true` e threshold de 80%, no template de serviço, para
  que os repositórios novos já nasçam com o gate ativo.

## Motivo

- Gratuito para repositórios públicos, e todos os repositórios da organização já são
  públicos.
- Integra com a proteção de branch do GitHub como check, que é a forma exigida pelo PDF.
- Subir e operar um SonarQube self-hosted apenas para esta entrega é desperdício de
  esforço e mais um workload disputando a cota do AWS Academy.

## Consequências

- O projeto passa a depender de um serviço externo no caminho do merge.
- Cobertura abaixo de 80% bloqueia PR, inclusive nos serviços novos enquanto ainda estão
  sendo escritos.
- A evidência de cobertura exigida no README de cada repositório pode ser o badge do
  Sonar, em vez de print manual.

## Alternativas

- **SonarQube self-hosted** — controle total, custo de operação injustificável no prazo.
- **Apenas o threshold do `bun test`** — mede cobertura, mas não entrega análise estática
  de qualidade nem badge, e o PDF pede verificação de qualidade, não só cobertura.
