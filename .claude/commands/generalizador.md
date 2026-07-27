---
description: Roda o Generalizador de etapa via subagente real
---

Rode o agente `generalizador` em foreground. Antes de agir, ele deve
ler por inteiro `AGENTS.md`, `.github/agents/generalizador.agent.md` e
`.github/skills/consignado-generalizacao/SKILL.md`.

Tarefa: $ARGUMENTS

Ele recebe o inventario do Leitor e a matriz do Comparador. Ele e
somente leitura e entrega proposta marcada `[PROPOSTA]` para nucleo,
templates-base, secoes internas e contrato de variaveis. Pare depois da
resposta: diferencas restantes seguem para `/especializador`.
