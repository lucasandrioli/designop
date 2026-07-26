---
description: Roda o agente variabilizador (componentiza e binda) via subagente real
---

Pré-requisito: um schema de variáveis APROVADO pelo usuário nesta conversa (saída do `/inventario`, revisada). Se não houver schema aprovado no contexto, PARE e peça antes de rodar este comando — não invente um schema para preencher a lacuna.

Rode o agente **variabilizador** via o Agent tool (subagent_type: general-purpose, run em foreground).

Monte o prompt do subagente assim:

"Você VAI ATUAR como o agente `variabilizador` deste repositório de DesignOps (crédito consignado, Itaú). Leia primeiro, por inteiro: .github/agents/variabilizador.agent.md (inclui as regras aprendidas em laboratório — gotcha de setBoundVariable em texto remoto invisible, regra de agrupar texto opcional com visible bindado, checar collection de domínio existente antes de criar nova) e docs/modelo-clusters.md (doutrina de binding PROPERTY FIRST) e docs/estrutura-lib.md (nomenclatura e carimbo). Siga à risca. Carregue a skill figma-plugin-api antes de qualquer use_figma, passe skillNames.

Descubra sozinho, via get_metadata, onde estão as referências cruas e a collection de domínio existente (se houver) — não espere node IDs prontos além do que a tarefa abaixo já informar.

Schema APROVADO (não adicione nem remova variáveis dele):
$ARGUMENTS

Siga o fluxo dos itens 1-8 do variabilizador.agent.md: reusar/criar collection, clonar e componentizar a referência indicada, bindar property-first, aplicar carimbo, rodar teste de equivalência (texto visível em ordem de documento, template por mode == referência do cluster, sem faltas nem sobras) e scripts/validateLayout.js em cada mode. Se algo nos dados reais contradisser uma premissa do schema aprovado, PARE — e faça a pergunta em LINGUAGEM SIMPLES, não em node ID (ex: 'o campo X mostra valores diferentes nas duas referências, mas o schema não previa isso — é engano na referência ou falta variável?'), não decida sozinho.

Relate ao final, EM DUAS PARTES: primeiro um resumo em linguagem simples (o que foi criado, bateu ou não bateu, em 3-5 linhas sem jargão), depois o detalhe técnico (node IDs, resultado do validateLayout por cluster) como apoio. Português, direto."

Depois que o subagente responder: repasse o resumo simples ao usuário primeiro. Se ele parou com uma pergunta ou contradição, refaça a pergunta em linguagem de negócio (não decida por ele) e aguarde. Se fechou limpo, resuma o resultado e pergunte se o usuário quer seguir para `/validador`.
