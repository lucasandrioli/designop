# Indice de copia manual (plano B)

Use isto **so se o VS Code do banco nao conseguir clonar do GitHub**.
Se o clone funcionar, ignore este arquivo: `git clone` traz tudo certo.

Base dos links raw:
https://raw.githubusercontent.com/lucasandrioli/designop/master/

Ordem de prioridade: se der pra copiar so alguns hoje, siga a ordem.
Nao copie nada de `laboratorio/`: e conteudo ficticio de teste, e se
cair em `docs/` o agente trata como regra real de convenio.

## CRITICO (sem isso nada funciona) — 16 arquivos

| # | Criar em |
| --- | --- |
| 1 | `.github/skills/figma-plugin-api/SKILL.md` |
| 2 | `AGENTS.md` (raiz) + `.github/copilot-instructions.md` |
| 3 | `.github/agents/leitor.agent.md` |
| 4 | `.github/agents/comparador.agent.md` |
| 5 | `.github/agents/generalizador.agent.md` |
| 6 | `.github/agents/especializador.agent.md` |
| 7 | `.github/agents/montador.agent.md` |
| 8 | `.github/agents/validador.agent.md` |
| 9 | `.github/agents/aprendiz.agent.md` |
| 10 | `.github/skills/consignado-leitura/SKILL.md` |
| 11 | `.github/skills/consignado-comparador/SKILL.md` |
| 12 | `.github/skills/consignado-generalizacao/SKILL.md` |
| 13 | `.github/skills/consignado-especializacao/SKILL.md` |
| 14 | `.github/skills/consignado-validacao/SKILL.md` |
| 15 | `scripts/validateLayout.js` |
| 16 | `scripts/validateCreation.js` |

O arquivo 1 e o mais importante de todos: sao as 46 regras da Plugin
API que fizeram tudo funcionar no laboratorio. Sem ele, o agente comete
os mesmos erros que ja cometemos e corrigimos.

## ESSENCIAL (a doutrina e o ambiente compartilhado) — 6 arquivos

| # | Criar em |
| --- | --- |
| 17 | `docs/modelo-clusters.md` |
| 18 | `docs/estrutura-lib.md` |
| 19 | `docs/instalacao.md` |
| 20 | `docs/runbook-banco.md` |
| 21 | `COMECE-AQUI.md` |
| 22 | `.vscode/mcp.json` |

## MOLDES (os formularios que voce vai preencher) — 4 arquivos

| # | Criar em |
| --- | --- |
| 23 | `docs/clusters/_template.md` |
| 24 | `docs/etapas/_template.md` |
| 25 | `docs/mapa-fluxo-_template.md` |
| 26 | `docs/receitas/_template.md` |

Estes chegam VAZIOS de proposito. Preencher os manuais de convenio e o
primeiro trabalho de conteudo do projeto, com produto e juridico.

## APOIO (util, nao bloqueia) — 7 arquivos

| # | Criar em |
| --- | --- |
| 27 | `docs/runbook-copilot.md` |
| 28 | `.claude/commands/leitor.md` |
| 29 | `.claude/commands/comparador.md` |
| 30 | `.claude/commands/generalizador.md` |
| 31 | `.claude/commands/especializador.md` |
| 32 | `.claude/commands/montador.md` |
| 33 | `.claude/commands/validador.md` |

Os slash commands so valem no Claude Code. No Copilot os agentes sao
selecionados no seletor de agente, entao estes comandos sao dispensaveis la.

`docs/glossario-apresentacao.md` (nomes simples para apresentar a
lideranca) e `laboratorio/fila-de-testes.md` (a evidencia dos 16 testes,
util quando perguntarem "por que essa regra existe?") sao opcionais e
nao entram no caminho de leitura dos agentes.

## Depois de copiar

1. Abrir o workspace, autenticar o MCP Figma e conferir os agentes
   (ver `COMECE-AQUI.md`)
2. Rodar `docs/runbook-copilot.md` e registrar a primeira cadeia manual
3. Rodar a bateria de fumaca (`docs/runbook-banco.md`) ANTES de construir
