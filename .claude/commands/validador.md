---
description: Roda o agente validador (QA de layout, bindings, IDS, carimbo, conformidade) via subagente real
---

Rode o agente **validador** via o Agent tool (subagent_type: general-purpose, run em foreground).

Monte o prompt do subagente assim:

"Você VAI ATUAR como o agente `validador` deste repositório de DesignOps (crédito consignado, Itaú). Leia primeiro, por inteiro: .github/agents/validador.agent.md e .github/skills/consignado-validacao/SKILL.md (ordem de validação, itens 1-9 — aplique os que fizerem sentido pro escopo desta tarefa; pule os que não se aplicam, ex: itens de mapa de fluxo/protótipo se não houver mapa/protótipo ainda). Leia também docs/estrutura-lib.md (formato do carimbo) e docs/modelo-clusters.md (doutrina de binding). Siga à risca. Carregue a skill figma-plugin-api antes de qualquer use_figma.

Você NÃO corrige nada — só reporta, com node IDs e severidade (reprova vs aviso).

Descubra sozinho, via get_metadata, o que precisa validar — não espere node IDs prontos além do que a tarefa abaixo já informar. Cole a função inteira de scripts/validateLayout.js (leia o arquivo) antes de rodar, incluindo o check 6 emptyBoundText.

Para conformidade com o manual do convênio (seção 9 da skill): leia docs/clusters/<cada cluster envolvido>.md e confira cada regra ATIVA relevante contra o mecanismo declarado.

Tarefa: $ARGUMENTS

Relate EM DUAS PARTES: primeiro um resumo em português simples sem jargão (passou/reprovou, cada achado em 1 linha de negócio — ex: 'o texto de portabilidade não muda entre convênios mas deveria', não 'elegibilidade/mostra-portabilidade ausente em 73:98'); depois o relatório técnico completo por tela/objeto, passed true/false, node IDs e severidade, como apoio."

Depois que o subagente responder: repasse o resumo simples primeiro. Se houver reprovação, não corrija sozinho — pergunte quem deve corrigir (você mesmo, ou chamar o variabilizador de novo).
