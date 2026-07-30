# Etapa: anuencia

Este e o catalogo canonico da etapa. Uma etapa representa uma capacidade
reutilizavel do produto, nao o comportamento de um cluster.

## Identificacao
- Nome da etapa: `anuencia`
- Objetivo: confirmar externamente que a pessoa usuaria e quem solicitou a contratacao de credito consignado.
- Pagina Figma: `Anuencia` (arquivo TESTE)

## Informacoes humanas minimas

A etapa e acionada depois que a pessoa conclui a solicitacao da operacao
de credito (ex: pcon, refin, portabilidade) e confirma a senha
transacional no app.

A anuencia e uma validacao externa. Ela nao significa aprovacao final
interna do Itau.

Fluxo-base da etapa:
orientacao -> direcionamento para canal externo -> validacao externa
conforme convenio -> retorno ao app -> carregamento -> fronteira de
efetivacao.

Ha dois caminhos:
1. caminho direto: orientacao -> direcionamento externo;
2. caminho de ajuda opcional: "Saiba o passo a passo" -> Tutorial 1 a 4
   -> mesmo direcionamento externo.

A bifurcacao com reencontro no direcionamento externo e regra
compartilhada da etapa, nao exclusiva de cluster.

As validacoes externas sao handoffs/evidencias de jornada, nao templates
da biblioteca.

Aplicacao na jornada:
- a etapa pode ser aplicada apos primeira concessao, refinanciamento e portabilidade de saldo;
- em portabilidade com refinanciamento, a mesma etapa pode ser chamada duas vezes em momentos diferentes:
  1. uma anuencia para a portabilidade;
  2. outra anuencia, depois, para o refinanciamento.

Topologia do fluxo:
- confirmada pelo designer nesta conversa;
- nao extraida das reacoes de prototipo via MCP nesta rodada.

## Inventario observado (preenchido pelo Analista)

| Caso de uso | Nivel | Passos e fronteiras | Ponto de partida no Figma | Status |
| --- | --- | --- | --- | --- |
| caminho principal direto | 1 | orientacao-confirmacao -> direcionamento-canal-externo -> handoff-validacao-externa-convenio -> handoff-retorno-ao-app -> fronteira-retorno-carregando -> fronteira-efetivacao | `_ref-cluster-4`, `_ref-gov-sp` | confirmado pelo designer |
| caminho de ajuda opcional | 2 | orientacao-confirmacao -> tutorial-1 -> tutorial-2 -> tutorial-3 -> tutorial-4 -> direcionamento-canal-externo -> handoff-validacao-externa-convenio -> handoff-retorno-ao-app -> fronteira-retorno-carregando -> fronteira-efetivacao | `_ref-cluster-4`, `_ref-gov-sp` | confirmado pelo designer |

Observacao:
- A existencia das telas internas foi observada no Figma.
- A topologia de bifurcacao, reencontro e handoffs foi confirmada pelo designer nesta conversa.
- As conexoes de prototipo nao foram expostas pelo MCP nesta rodada.

## Historico
- 2026-07-30: rascunho inicial de contexto guiado da etapa anuencia.
