# Indice de copia manual (plano B)

Use isto **so se o VS Code do banco nao conseguir clonar do GitHub**.
Se o clone funcionar, ignore este arquivo: `git clone` traz tudo certo.

Base dos links raw:
https://raw.githubusercontent.com/lucasandrioli/designop/master/

Ordem de prioridade: se der pra copiar so alguns hoje, siga a ordem.
Nao copie nada de `laboratorio/`: e conteudo ficticio de teste, e se
cair em `docs/` o agente trata como regra real de convenio.

## CRITICO (sem isso nada funciona) — 9 arquivos

| # | Criar em |
| --- | --- |
| 1 | `.github/skills/figma-plugin-api/SKILL.md` |
| 2 | `.github/copilot-instructions.md` |
| 3 | `.github/agents/comparador.agent.md` |
| 4 | `.github/agents/montador.agent.md` |
| 5 | `.github/agents/validador.agent.md` |
| 6 | `.github/agents/aprendiz.agent.md` |
| 7 | `.github/skills/consignado-comparador/SKILL.md` |
| 8 | `.github/skills/consignado-validacao/SKILL.md` |
| 9 | `scripts/validateLayout.js` |

O arquivo 1 e o mais importante de todos: sao as 44 regras da Plugin
API que fizeram tudo funcionar no laboratorio. Sem ele, o agente comete
os mesmos erros que ja cometemos e corrigimos.

## ESSENCIAL (a doutrina que os agentes leem) — 5 arquivos

| # | Criar em |
| --- | --- |
| 10 | `docs/modelo-clusters.md` |
| 11 | `docs/estrutura-lib.md` |
| 12 | `docs/instalacao.md` |
| 13 | `docs/runbook-banco.md` |
| 14 | `COMECE-AQUI.md` |

## MOLDES (os formularios que voce vai preencher) — 4 arquivos

| # | Criar em |
| --- | --- |
| 15 | `docs/clusters/_template.md` |
| 16 | `docs/etapas/_template.md` |
| 17 | `docs/mapa-fluxo-_template.md` |
| 18 | `docs/receitas/_template.md` |

Estes chegam VAZIOS de proposito. Preencher os manuais de convenio e o
primeiro trabalho de conteudo do projeto, com produto e juridico.

## APOIO (util, nao bloqueia) — 3 arquivos

| # | Criar em |
| --- | --- |
| 19 | `.claude/commands/comparador.md` |
| 20 | `.claude/commands/montador.md` |
| 21 | `.claude/commands/validador.md` |

Os slash commands so valem no Claude Code. No Copilot os agentes sao
selecionados no seletor de agente, entao estes tres sao dispensaveis la.

`docs/glossario-apresentacao.md` (nomes simples para apresentar a
lideranca) e `laboratorio/fila-de-testes.md` (a evidencia dos 16 testes,
util quando perguntarem "por que essa regra existe?") sao opcionais e
nao entram no caminho de leitura dos agentes.

## Depois de copiar

1. Conectar o MCP do Figma no VS Code (ver `COMECE-AQUI.md`)
2. Conferir `/skills` no chat
3. Rodar a bateria de fumaca (`docs/runbook-banco.md`) ANTES de construir
