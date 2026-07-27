---
description: Roda o Montador de etapa via subagente real
---

Pre-requisito: proposta consolidada aprovada pelo usuario nesta conversa.
Ela precisa incluir templates-base, especializacoes, schema de variaveis
e plano de componentizacao. Sem isso, pare e peca a aprovacao.

Rode o agente `montador` em foreground. Antes de agir, ele deve ler por
inteiro `AGENTS.md`, `.github/agents/montador.agent.md`,
`docs/modelo-clusters.md`, `docs/estrutura-lib.md`, o catalogo da etapa,
o mapa e os manuais dos clusters envolvidos. Carregue
`figma-plugin-api` antes de qualquer escrita.

Tarefa e proposta aprovada: $ARGUMENTS

O Montador preserva referencias, constroi primeiro as secoes internas,
depois templates-base e por ultimo especializacoes aprovadas. Ele valida
equivalencia por cluster e caso de uso. Relate primeiro o resumo simples
e depois os detalhes tecnicos.
