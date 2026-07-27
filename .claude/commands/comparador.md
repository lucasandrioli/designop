---
description: Roda o Comparador de etapa via subagente real
---

Rode o agente `comparador` em foreground. Antes de agir, ele deve ler
por inteiro `AGENTS.md`, `.github/agents/comparador.agent.md`,
`.github/skills/consignado-comparador/SKILL.md`, o catalogo da etapa e
os manuais dos clusters envolvidos.

Tarefa: $ARGUMENTS

Ele e somente leitura e recebe o inventario produzido pelo `/leitor`.
Se faltar pre-requisito, devolva a lista completa em linguagem de
negocio. A saida deve trazer primeiro a tabela comparativa de fatos e
depois o detalhe tecnico. Pare depois da resposta: o proximo passo e
`/generalizador`, nunca o Montador.
