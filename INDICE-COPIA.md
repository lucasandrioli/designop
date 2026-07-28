# Indice de copia manual para o banco

Use este indice somente se o VS Code do banco nao conseguir clonar o
repositorio. Se o clone funcionar, ele continua sendo a forma mais
segura de trazer os arquivos.

Base dos links raw:

```text
https://raw.githubusercontent.com/lucasandrioli/designop/master/
```

Copie os arquivos abaixo preservando exatamente os caminhos. Nao leve
`laboratorio/`, `.claude/` nem arquivos `.DS_Store`: eles nao sao
necessarios para usar os agentes no Copilot.

## Necessarios para os agentes

```text
AGENTS.md
.github/copilot-instructions.md
.vscode/mcp.json

.github/agents/leitor.agent.md
.github/agents/comparador.agent.md
.github/agents/generalizador.agent.md
.github/agents/especializador.agent.md
.github/agents/montador.agent.md
.github/agents/validador.agent.md
.github/agents/aprendiz.agent.md

.github/skills/figma-plugin-api/SKILL.md
.github/skills/consignado-leitura/SKILL.md
.github/skills/consignado-comparador/SKILL.md
.github/skills/consignado-generalizacao/SKILL.md
.github/skills/consignado-especializacao/SKILL.md
.github/skills/consignado-montagem/SKILL.md
.github/skills/consignado-validacao/SKILL.md
```

## Necessarios para validacao

```text
scripts/validateLayout.js
scripts/validateCreation.js
scripts/validateContentContract.js
scripts/validateModeBehavior.js
scripts/validatePromotion.js
```

## Doutrina e operacao

```text
COMECE-AQUI.md
docs/modelo-clusters.md
docs/estrutura-lib.md
docs/topologia-biblioteca.md
docs/instalacao.md
docs/contrato-papeis.md
docs/runbook-banco.md
docs/runbook-copilot.md
```

## Moldes para o primeiro ciclo real

```text
docs/clusters/_template.md
docs/etapas/_template.md
docs/mapa-fluxo-_template.md
docs/receitas/_template.md
```

Esses moldes chegam vazios de proposito. Preencha somente o que for
verdadeiro para a etapa e os clusters escolhidos. O que ainda nao souber
fica como `[CONFIRMAR]`.

## Arquivos opcionais

```text
docs/glossario-apresentacao.md
```

## Depois de copiar

1. Abra o workspace no VS Code e autentique o MCP Figma.
2. Confirme os sete agentes em `Chat: Open Customizations`.
3. Rode `docs/runbook-copilot.md` com uma etapa real e dois clusters
   reais.
4. Rode `docs/runbook-banco.md` em um arquivo Figma descartavel antes
   de montar qualquer template.
