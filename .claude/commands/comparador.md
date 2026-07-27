---
description: Roda o agente comparador (comparador de clusters) via subagente real
---

Rode o agente **comparador** deste projeto via o Agent tool (subagent_type: general-purpose, run em foreground — o resultado dele precisa ser revisado antes de qualquer próximo passo).

Monte o prompt do subagente assim, sem inventar nem remover instruções:

"Você VAI ATUAR como o agente `comparador` deste repositório de DesignOps (crédito consignado, Itaú). Leia primeiro, por inteiro: .github/copilot-instructions.md (regras sempre ativas do projeto), .github/agents/comparador.agent.md e a skill que ele indica (.github/skills/consignado-comparador/SKILL.md). Siga à risca. Carregue a skill figma-plugin-api antes de qualquer use_figma, e passe skillNames nas chamadas.

Você é SOMENTE LEITURA — nenhum script use_figma pode ter .create*, .remove, atribuição de propriedade ou appendChild.

ANTES DE TUDO, dois passos da skill, nunca pule:

CHECAGEM INICIAL (docs/instalacao.md): confira se existe manual dos clusters envolvidos em docs/clusters/, doc da etapa em docs/etapas/, se são 2+ clusters, se há uma tela de referência por cluster, e — quando a etapa tiver 2+ telas — se elas estão ligadas por protótipo com flow starting point nomeado (o protótipo é a fonte do mapa de fluxo; sem ele não há composição a extrair, só comparação tela a tela). Rode TODAS as checagens antes de reportar, mesmo já tendo achado um bloqueio: as primeiras se resolvem lendo o repositório, a do protótipo exige abrir o Figma (leitura, permitida). Reportar só o primeiro bloqueio custa uma ida e volta a mais para o designer. Se faltar manual de cluster, tela de referência ou protótipo, PARE e devolva a lista COMPLETA do que falta em linguagem de negócio — sem manual você inventaria a razão de cada divergência. Fonte suja (detached, sem nome, sem auto layout) NÃO é motivo para parar; fonte ausente é.

PERGUNTAS ANTES DE COMEÇAR: se a tarefa abaixo não já disser explicitamente (a) onde estão as telas, (b) de qual etapa são, (c) de quais clusters é cada tela, e (d) se é caminho feliz ou ramo de exceção/desdobramento — PARE e pergunte isso ao usuário antes de tocar em qualquer use_figma. O designer não precisa saber nomear/organizar telas do jeito que a doutrina pede; normalizar é seu trabalho, não dele. Só depois de ter as 4 respostas, descubra o arquivo e os node IDs SOZINHO via get_libraries e get_metadata (Passo 1) e proponha a normalização de nomes (ref-nome-cluster) antes de comparar — nunca renomeie sem aprovação.

Tarefa: $ARGUMENTS

Saída EM DUAS PARTES, nesta ordem (seção 'Saída' da skill consignado-comparador, atualizada): primeiro uma TABELA comparativa markdown — colunas: `#`, `Achado`, `Onde` (nome da tela + link/node ID de cada versão comparada, SEMPRE presente), uma coluna POR CLUSTER com o conteúdo real daquela tela (nunca invente o texto; se as versões tiverem tamanhos diferentes, liste TODOS os itens de cada uma, não só a diferença), `Pergunta` (com "⚠" embutido quando o achado pode ser mais profundo que copy), `Proposto`. NUNCA uma linha sem o conteúdo real de cada cluster OU sem a coluna Onde — isso já foi reportado como "mecânico, sem contexto", depois "não dá pra ser em tabela/comparativo?", depois "não tem referência de qual é a tela" numa rodada real; as três coisas são regra agora. Não pergunte sobre algo já sabido (ex: conteúdo marcado [EXEMPLO] pelo construtor não precisa de linha "isso é exemplo?"). Fecha pedindo 'responda com o número + sim/não, se não me diga o motivo'. Depois disso, o detalhe técnico completo (matriz nó a nó, node IDs, tabelas técnicas) como referência/apoio, não como a parte principal. Incerteza vira [VERIFICAR COM DESIGNER]."

Depois que o subagente responder: repasse o CHECKLIST ao usuário quase literalmente (é a parte que ele vai ler) e deixe o detalhe técnico disponível mas não repetido por extenso. PARE — não chame o montador sozinho. Aprovação do schema pelo designer é checkpoint obrigatório do projeto (docs/estrutura-lib.md, COMECE-AQUI.md), não pule mesmo que o schema pareça óbvio.
