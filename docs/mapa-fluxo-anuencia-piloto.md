# Mapa de fluxo: anuencia-piloto

Este documento e a fonte unica da composicao para este escopo.

## Escopo
- Convenios cobertos: cluster-4, gov-sp
- Aplicacao da etapa: pode ocorrer apos primeira concessao, refinanciamento e portabilidade de saldo; em portabilidade com refinanciamento, pode ocorrer duas vezes em momentos distintos da jornada.
- Observacao: cobre a etapa anuencia e suas fronteiras imediatas de jornada.

## Tabela de composicao

| # | Etapa / passo / fronteira | Caso de uso | Nivel | Gatilho | cluster-4 | gov-sp |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | anuencia/orientacao | base da etapa | 1 | apos senha transacional | FAQ proprio do cluster | FAQ proprio do cluster |
| 2 | anuencia/direcionamento | ponto de reencontro dos caminhos | 1 | seguir direto ou concluir tutorial | SouGov | Sou SP |
| 3 | handoff/canal-externo-convenio | continuidade fora do app | 1 | saida do app para validacao externa | canal SouGov | canal Sou SP e um segundo canal externo [CONFIRMAR] |
| 4 | handoff/validacao-externa-convenio | continuidade fora do app | 1 | validacoes exigidas pelo convenio | 1 validacao externa (evidencia, nao template) | 2 validacoes externas (evidencia, nao template) |
| 5 | handoff/retorno-ao-app | retorno ao app Itau | 1 | fim da validacao externa | sem diferenca registrada | sem diferenca registrada |
| 6 | fronteira/retorno-carregando | fronteira de transicao | 1 | retorno ao app | sem diferenca registrada | sem diferenca registrada |
| 7 | fronteira/efetivacao | fronteira de transicao | 1 | continuidade apos carregamento | sem diferenca registrada | sem diferenca registrada |
| 8 | anuencia/tutorial-1 | caminho de ajuda opcional | 2 | \|Saiba o passo a passo\| | sem diferenca registrada | sem diferenca registrada |
| 9 | anuencia/tutorial-2 | caminho de ajuda opcional | 2 | \|Proximo passo\| | sem diferenca registrada | sem diferenca registrada |
| 10 | anuencia/tutorial-3 | caminho de ajuda opcional | 2 | \|Proximo passo\| | sem diferenca registrada | sem diferenca registrada |
| 11 | anuencia/tutorial-4 | caminho de ajuda opcional | 2 | \|Ir para confirmacao externa\| | sem diferenca registrada | sem diferenca registrada |

Fonte da topologia:
- bifurcacao opcional, reencontro, handoff externo e retorno confirmados pelo designer nesta conversa;
- reacoes entre orientacao, tutoriais e direcionamento confirmadas pelo MCP em 2026-08-02;
- retorno ao app mantido como fronteira confirmada pelo designer.

## Grafo por convenio e caso de uso

### topologia compartilhada da etapa (confirmada pelo designer)
```mermaid
flowchart TD
    a[Anuencia: orientacao] -->|seguir direto| b[Direcionamento para canal externo]
    a -.->|Saiba o passo a passo| t1([Tutorial 1])
    t1 -.-> t2([Tutorial 2])
    t2 -.-> t3([Tutorial 3])
    t3 -.-> t4([Tutorial 4])
    t4 -.-> b
    b --> x{Validacao externa conforme convenio}
    x -->|Cluster 4: SouGov, 1 validacao externa| r[Retorno ao app]
    x -->|Gov SP: Sou SP, 2 validacoes externas; segundo canal externo [CONFIRMAR]| r
    r --> c[Fronteira: retorno-carregando]
    c --> d[Fronteira: efetivacao]
```

## Justificativas das diferencas

| Divergencia | Cluster | Regra que explica |
| --- | --- | --- |
| quantidade de validacoes externas no handoff | cluster-4, gov-sp | `docs/clusters/cluster-4.md#R1`, `docs/clusters/gov-sp.md#R1` |
| canal externo utilizado | cluster-4, gov-sp | `docs/clusters/cluster-4.md#R2`, `docs/clusters/gov-sp.md#R2` |
| segundo canal externo no gov-sp | gov-sp | [CONFIRMAR] |

Observacao:
- diferencas registradas como regra de convenio;
- mecanismo tecnico fica para a proxima rodada de analise.

## Historico
- 2026-07-30: rascunho inicial do mapa de fluxo da etapa anuencia.
