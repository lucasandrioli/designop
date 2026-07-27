---
description: Roda o Leitor de etapa via subagente real
---

Rode o agente `leitor` em foreground. Antes de agir, ele deve ler por
inteiro `AGENTS.md`, `.github/agents/leitor.agent.md` e
`.github/skills/consignado-leitura/SKILL.md`.

Tarefa: $ARGUMENTS

Ele e somente leitura. Deve inventariar a pagina da etapa, suas secoes
por cluster, casos de uso e prototipos sem explicar regra de negocio ou
propor implementacao. Entregue o inventario ao usuario e pare: ele sera
entrada do `/comparador`.
