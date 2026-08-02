# Etapa: anuencia

Este e o catalogo canonico da etapa. Uma etapa representa uma capacidade
reutilizavel do produto, nao o comportamento de um cluster.

## Identificacao
- Nome da etapa: `anuencia`
- Objetivo: confirmar externamente que a pessoa usuaria e quem solicitou a contratacao de credito consignado.
- Modalidades: primeira concessao, refinanciamento e portabilidade de saldo
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
- confirmada tambem pelas reacoes lidas nas referencias pelo MCP em
  2026-08-02.

## Inventario observado (preenchido pelo Analista)

| Caso de uso | Nivel | Passos e fronteiras | Ponto de partida no Figma | Status |
| --- | --- | --- | --- | --- |
| caminho principal direto | 1 | orientacao-confirmacao -> direcionamento-canal-externo -> handoff-validacao-externa-convenio -> handoff-retorno-ao-app -> fronteira-retorno-carregando -> fronteira-efetivacao | `_ref-cluster-4`, `_ref-gov-sp` | confirmado pelo designer |
| caminho de ajuda opcional | 2 | orientacao-confirmacao -> tutorial-1 -> tutorial-2 -> tutorial-3 -> tutorial-4 -> direcionamento-canal-externo -> handoff-validacao-externa-convenio -> handoff-retorno-ao-app -> fronteira-retorno-carregando -> fronteira-efetivacao | `_ref-cluster-4`, `_ref-gov-sp` | confirmado pelo designer |

Fonte da topologia: confirmado pelo designer nesta conversa.

Observacao:
- A existencia das telas internas foi observada no Figma.
- A topologia de bifurcacao, reencontro e handoffs foi confirmada pelo designer nesta conversa.
- O MCP confirmou as reacoes da acao principal e da ajuda na orientacao,
  a sequencia Tutorial 1 a 4 e o handoff do direcionamento para a
  evidencia externa. O retorno ao app continua sendo uma fronteira da
  jornada, nao um template da etapa.

## Telas da biblioteca

Nome livre de frame de referencia e apenas evidencia. A tela da
biblioteca recebe nome curto, estavel e orientado ao papel na jornada.

| Frame de referencia | Tela da biblioteca | Papel na jornada | Estado |
| --- | --- | --- | --- |
| `orientacao-confirmacao` | `orientacao` | apresenta a validacao externa e oferece seguir ou ver ajuda | bloqueada pela ilustracao proprietaria |
| `tutorial-1` | `tutorial-1` | primeira instrucao opcional | aprovada para rascunho |
| `tutorial-2` | `tutorial-2` | segunda instrucao opcional | aprovada para rascunho |
| `tutorial-3` | `tutorial-3` | terceira instrucao opcional | aprovada para rascunho |
| `tutorial-4` | `tutorial-4` | ultima instrucao e saida para o canal | aprovada para rascunho |
| `direcionamento-sougov`, `direcionamento-sou-sp` | `direcionamento` | informa a saida do app para o canal externo | aprovada para rascunho |

## Contrato aprovado para a rodada

### Conteudo e modes

- Collection: `Conteudo · Anuencia`.
- Modes: `Gov SP` e `Cluster 4`.
- Convencao: cada variavel comeca pela tela da biblioteca, por exemplo
  `tutorial-1/titulo`, `tutorial-1/descricao`,
  `tutorial-1/acao` e `direcionamento/canal`.
- A orientacao tambem usa conteudo por tela, incluindo os quatro itens
  de duvidas frequentes. As diferencas de FAQ sao conteudo por mode,
  nunca uma nova estrutura de tela.

| Tela da biblioteca | Papeis de conteudo desta rodada |
| --- | --- |
| `tutorial-1` a `tutorial-4` | `titulo`, `evidencia-titulo`, `evidencia-descricao`, `progresso`, `acao` |
| `direcionamento` | `canal`, `titulo`, `mensagem` |
| `orientacao` | `titulo`, `descricao`, `acao-primaria`, `acao-ajuda`, `faq-1` a `faq-4` |

### Objetos a montar

| Objeto | Estado nesta rodada | Observacao |
| --- | --- | --- |
| `_rascunho-anuencia-tutorial-1` a `_rascunho-anuencia-tutorial-4` | montar | uma tela publica por passo, para que cada uma binde seu proprio grupo de conteudo |
| `_rascunho-anuencia-direcionamento` | montar | o handoff externo continua no mapa e nao recebe destino fixo no template |
| `_rascunho-anuencia-orientacao` | bloqueado | exige ilustracao da biblioteca proprietaria do Itau; nao criar substituto local |

Os rascunhos usam a pagina `_verificacao-anuencia`, sem prototipo. A
conexao para canais externos fica nas referencias e no mapa de fluxo.

Nos tutoriais, `evidencia-externa-no-tutorial` e uma secao local
aprovada: ela documenta o que a pessoa deve encontrar no canal externo,
mas nao transforma a tela do canal externo em componente da biblioteca.
O rodape da tela mobile tem os dois ultimos filhos fixos: progresso e
acao primaria.

## Comportamento de interface confirmado

Nas telas `tutorial-1` a `tutorial-4`, a navegacao do tutorial fica
ancorada no rodape mobile: indicador de progresso e acao de avancar ou
de sair para o canal externo. O conteudo instrucional pode rolar sob essa
area. No contrato tecnico, cada tela declara os nomes concretos desses
filhos fixos, pois o CTA final tem nome diferente.

## Historico
- 2026-07-30: rascunho inicial de contexto guiado da etapa anuencia.
- 2026-08-02: topologia aprovada para o arquivo TESTE, com a collection
  `Conteudo · Anuencia` e os modes `Gov SP` e `Cluster 4`.
- 2026-08-02: rascunhos de `tutorial-1` a `tutorial-4` e
  `direcionamento` montados em `_verificacao-anuencia`. A auditoria da
  rodada confirmou bindings de conteudo, heranca de mode nos previews,
  rodape fixo dos tutoriais e ausencia de sobreposicao entre secoes.
- 2026-08-02: `orientacao` permanece bloqueada ate a biblioteca
  proprietaria disponibilizar a ilustracao aprovada.
