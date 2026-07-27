# Indice de copia manual (VS Code do banco)

22 arquivos. Crie as pastas e cole o conteudo de cada raw.
Ordem de prioridade: se der pra copiar so alguns hoje, siga a ordem.

Base dos links raw:
https://raw.githubusercontent.com/lucasandrioli/agents-figma/main/

## CRITICO (sem isso nada funciona) — 8 arquivos

| # | Criar em | Raw |
| --- | --- | --- |
| 1 | .github/skills/figma-plugin-api/SKILL.md | .github/skills/figma-plugin-api/SKILL.md |
| 2 | .github/copilot-instructions.md | .github/copilot-instructions.md |
| 3 | .github/agents/comparador.agent.md | .github/agents/comparador.agent.md |
| 4 | .github/agents/montador.agent.md | .github/agents/montador.agent.md |
| 5 | .github/agents/validador.agent.md | .github/agents/validador.agent.md |
| 6 | .github/agents/aprendiz.agent.md | .github/agents/aprendiz.agent.md |
| 7 | .github/skills/consignado-comparador/SKILL.md | .github/skills/consignado-comparador/SKILL.md |
| 8 | .github/skills/consignado-validacao/SKILL.md | .github/skills/consignado-validacao/SKILL.md |

O arquivo 1 e o mais importante de todos: sao as 39 regras da Plugin
API que fizeram tudo funcionar no laboratorio. Sem ele, o agente comete
os mesmos erros que ja cometemos e corrigimos.

## ESSENCIAL (a doutrina que os agentes leem) — 4 arquivos

| # | Criar em |
| --- | --- |
| 9 | scripts/validateLayout.js |
| 10 | docs/modelo-clusters.md |
| 11 | docs/estrutura-lib.md |
| 12 | COMECE-AQUI.md |

## ESSENCIAL — manuais dos convenios (o PORQUE das regras)

| # | Criar em |
| --- | --- |
| 13 | docs/clusters/_template.md |
| 14 | docs/clusters/c1-mg.md |
| 15 | docs/clusters/c4-federais.md |

Estes sao RASCUNHOS com [CONFIRMAR]. Corrigir com o time de produto e
o juridico e o primeiro trabalho de conteudo do projeto: sem eles, os
agentes nao sabem POR QUE cada convenio diverge.

## APOIO (util, nao bloqueia) — 6 arquivos

| # | Criar em |
| --- | --- |
| 16 | docs/runbook-banco.md |
| 17 | docs/mapa-fluxo-piloto.md |
| 18 | docs/receitas/_comuns.md |
| 19 | docs/receitas/simular-e-contratar-simulacao.md |
| 20 | docs/fila-de-testes.md |
| 21 | docs/glossario-apresentacao.md |

## Depois de copiar

1. Conectar o MCP do Figma no VS Code (ver COMECE-AQUI.md)
2. Conferir /skills no chat do Copilot
3. Rodar a bateria de fumaca (docs/runbook-banco.md) ANTES de construir
