# Etapa: Anuencia

Este e o catalogo canonico da etapa. Uma etapa representa uma capacidade
reutilizavel do produto, nao o comportamento de um cluster.

## Identificacao
- Nome da etapa: `anuencia`
- Objetivo: confirmar externamente que foi a propria pessoa quem solicitou uma operacao de credito consignado
- Modalidades aplicaveis: primeira concessao, refinanciamento, portabilidade
- Pagina Figma: `Anuencia`

## Informacoes humanas minimas

A Anuencia acontece depois que a pessoa termina de solicitar a operacao
de credito e confirma a senha transacional no app Itau.

A etapa comeca na tela de orientacao para validacao externa e termina
quando a pessoa conclui as validacoes exigidas pelo convenio e retorna ao
app Itau.

Quantidade, canais e formato das validacoes externas variam por convenio.

## Chamadas na jornada

A mesma etapa pode ser chamada mais de uma vez em momentos diferentes da
jornada. Em portabilidade com refinanciamento, a Anuencia pode ser
chamada duas vezes: uma para a portabilidade e outra, depois da conclusao
da portabilidade, para o refinanciamento.

Em cada chamada, quantidade e formato das validacoes externas continuam
seguindo as regras do convenio.

## Inventario observado

| Caso de uso | Nivel | Passos e fronteiras | Ponto de partida no Figma | Fonte da topologia | Status |
| --- | --- | --- | --- | --- | --- |
| caminho direto para validacao externa | 1 | orientacao -> direcionamento externo -> handoff de validacao externa -> carregamento no retorno ao app -> efetivacao | referencias dos dois convenios | prototipo | observado |
| caminho via tutorial opcional | 2 | orientacao -> tutorial-1 -> tutorial-2 -> tutorial-3 -> tutorial-4 -> direcionamento externo -> handoff de validacao externa -> carregamento no retorno ao app -> efetivacao | referencias dos dois convenios | prototipo | observado |

Carregamento no retorno ao app e efetivacao sao fronteiras posteriores da
jornada e nao fazem parte dos templates da etapa Anuencia.

## Telas internas observadas

| Tela interna observada | ID curto | Frames de referencia pareados | Evidencia usada | Status |
| --- | --- | --- | --- | --- |
| orientacao para validacao externa | `orientacao` | orientacao-confirmacao dos dois convenios | reacoes + metadata | observado |
| tutorial, passo 1 | `tutorial-1` | tutorial-1 dos dois convenios | reacoes + metadata | observado |
| tutorial, passo 2 | `tutorial-2` | tutorial-2 dos dois convenios | reacoes + metadata | observado |
| tutorial, passo 3 | `tutorial-3` | tutorial-3 dos dois convenios | reacoes + metadata | observado |
| tutorial, passo 4 | `tutorial-4` | tutorial-4 dos dois convenios | reacoes + metadata | observado |
| direcionamento para validacao externa | `direcionamento-externo` | direcionamento dos dois convenios | reacoes + metadata | observado |

Essas telas foram registradas como passos observados. A decisao de quais
delas podem compartilhar um template pertence a rodada posterior de
`/consignado-analise`.

## Handoffs e evidencias externas

As evidencias abaixo comprovam a navegacao fora do app. Elas nao sao
telas internas, templates ou componentes da biblioteca.

| Handoff | Evidencia observada | Papel na jornada | Cluster 4 | Gov SP |
| --- | --- | --- | --- | --- |
| validacao externa | cadeia de evidencias conectada ao direcionamento e ao retorno | saida para confirmacao exigida pelo convenio e retorno ao app | SouGov, 1 validacao | Sou SP e prova de vida no gov.br, 2 validacoes |

## Escopo do contexto guiado

Registro encerrado em contexto guiado. Template, IDS, variaveis,
properties, variants, especializacoes e contratos tecnicos ficam para
`/consignado-analise`.

## Historico
- 2026-08-03: contexto registrado e topologia revisada para preservar telas internas e handoffs externos.
