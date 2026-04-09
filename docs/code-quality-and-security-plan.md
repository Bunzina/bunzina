# Code Quality and Security Plan

## Context

Este documento registra a decisao de qualidade e seguranca de codigo para o Bunzina, o escopo atual de implementacao e o planejamento por fases.

## Decision Summary

- Ferramenta escolhida nesta etapa: **Semgrep OSS**.
- Ferramentas nao incluidas por enquanto: scan de container/dependencias (ex.: Trivy).
- Politica de execucao no CI: **advisory** (nao bloquear merge por findings do Semgrep).
- Objetivo: aumentar visibilidade de risco sem interromper o fluxo de entrega no inicio da adocao.

## Why Semgrep OSS

- Boa cobertura para TypeScript e padroes de seguranca comuns.
- Integracao simples com GitHub Actions.
- Suporte a SARIF para publicacao em Security tab do GitHub.
- Permite evoluir para regras customizadas no futuro (ex.: convencoes da arquitetura em camadas).

## Current Scope

- Analise estatica de seguranca e qualidade em `src/**` e `migrations/**`.
- Execucao automatica em workflow dedicado para eventos de PR.
- Publicacao de resultado via artifact SARIF e tentativa de envio para GitHub Security.
- Execucao do scanner no padrao oficial Semgrep com `container.image: semgrep/semgrep` no nivel do job.
- Verificacoes complementares de qualidade basica em workflow dedicado de PR: `oxlint` e `oxfmt --check`.

## CI Implementation Plan

### Phase 1: Enable visibility

1. Adicionar workflow dedicado de PR com job `Semgrep OSS (Advisory)`.
2. Rodar scan no modo recomendado (`--config auto`).
3. Gerar arquivo `semgrep.sarif`.
4. Publicar SARIF como artifact e enviar para GitHub Security quando disponivel.

### Phase 2: Stabilize triage

1. Estabelecer rotina de triagem dos achados por severidade.
2. Tratar falso-positivo com justificativa tecnica e ajuste de regra quando necessario.
3. Definir baseline inicial para reduzir ruido do legado e focar novos achados em PR.

### Phase 3: Reassess policy

1. Revisar metricas apos 2-4 semanas:
   - volume de findings por severidade
   - taxa de falso-positivo
   - tempo medio de correcao
2. Decidir se evolui de advisory para bloqueio parcial por severidade.

## Alert Interpretation Guidelines

Para cada finding, considerar:

- Severidade: priorizacao de resposta
- Regra: classe de problema detectada
- Localizacao: arquivo e linha afetados
- Remediacao: ajuste sugerido pela regra

Prioridade inicial de resposta:

1. HIGH/CRITICAL: tratar imediatamente ou justificar risco aceito temporariamente.
2. MEDIUM/LOW: tratar no ciclo corrente quando possivel, com backlog quando necessario.

## Out of Scope (for now)

- Bloqueio automatico de merge por findings de Semgrep.
- Scan de imagem Docker e dependencias de runtime.
- Politicas de compliance avancadas.

## Ownership

- Time de desenvolvimento: corrigir findings e manter triagem atualizada.
- Responsavel tecnico do repositorio: revisar regras, ruido e decisao de endurecimento de politica.
