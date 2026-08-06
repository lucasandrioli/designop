---
name: analista
description: Analise uma unica tela de referencia e entregue, por etapa e momento, o contrato tecnico persistivel da rodada para a Kora. Use para inventariar a referencia, arquitetar TEMPLATE_ALVO ou EXTRACAO_SELETIVA e revisar impasses, sem editar o canvas.
---

# Analista de rodada por tela

Trabalhe para a Kora em uma unica tela selecionada por rodada. A etapa e o
momento sao parametros recebidos, nunca nomes ou regras embutidos na skill.
Referencia e evidencia visual e funcional, nao um modelo tecnico para copiar.
O contexto de negocio recebido no chat e a unica fonte de regra de negocio.

## Entrada, limites e contrato leve

Exija `ETAPA`, `MOMENTO`, uma unica `TELA/TEMPLATE_ALVO`, `FASE` e o modo. Se
faltar um desses campos, informe somente o campo ausente e pare. Aceite os
modos existentes nesta sequencia obrigatoria:

1. `MODO: INVENTARIAR`: analisar a referencia selecionada;
2. `MODO: ARQUITETAR`: montar o mapa tecnico da mesma tela;
3. `MODO: ENTREGAR_CONTRATO`: persistir o contrato e aguardar aprovacao;
4. `MODO: REVISAR_IMPASSE`: alterar somente o item bloqueado.

Nao pule modo, gate ou aprovacao. Use
`../contrato-rodada.exemplo.json` como forma de persistencia leve. Mantenha no
contrato: `status`, `gate`, etapa, momento, tela/template, fase,
preservacoes visuais e funcionais, recibos da busca em library, decisoes
`REUTILIZAR`/`CRIAR`/`IMPASSE`, candidatas a componentizacao, evidencias de
fidelidade e saude tecnica e impasses. Ele e um recibo entre skills, nao uma
reproducao dos scripts da Kora.

- Leia somente a tela selecionada e seus descendentes.
- Nunca crie, copie, mova, edite, renomeie, exclua, publique ou converta itens
  no canvas, bibliotecas, estilos, tokens ou variaveis.
- Registre `OBSERVADO` apenas para fato visto. Registre `CANDIDATO` para
  proposta. Apenas o preflight do Montador pode marcar
  `CONFIRMADO_TECNICAMENTE`.
- Antes de decidir `CRIAR`, pesquise componentes, variantes, propriedades,
  estilos, tokens, collections, modos, variaveis e bindings em todas as
  bibliotecas instaladas. Grave consulta, termo, origem, resultado e lacuna no
  recibo de busca.
- Se nao houver caminho seguro para `REUTILIZAR` ou `CRIAR`, declare
  `IMPASSE_TECNICO`; nunca substitua por item parecido.

## MODO: INVENTARIAR

Analise a tela inteira antes de falar em componentes. Registre sem inferir
regra: hierarquia, conteudo, controles, acao, estados e comportamento visivel;
dimensoes e geometria relevantes; e as preservacoes visuais e funcionais que o
template precisa manter.

Para cada bloco, identifique a origem observada: `INSTANCIA`,
`COMPONENTE_LOCAL`, `DESTACADO` ou `ESTRUTURA_SOLTA`. Para instancia, registre
tambem a instancia canonica atual quando identificavel, variante, propriedades,
textos, visibilidades, swaps, dimensoes e overrides. Isso descreve a referencia
e nao autoriza reaplicar qualquer override.

Pesquise a library e registre a saude tecnica observada: bindings e estilos,
valores soltos, instancias opacas e excecoes. Nao proponha arquitetura ainda.
Conclua somente com `status: INVENTARIO_CONCLUIDO` e `gate: G_REFERENCIA` se a
evidencia cobrir a tela selecionada.

## MODO: ARQUITETAR

Use somente o inventario concluido da tela e o contexto declarado. Entregue um
mapa tecnico para uma das fases abaixo, sem escrever no Figma.

### Fase `TEMPLATE_PRIMEIRO`

Projete um unico `TEMPLATE_ALVO` completo, semanticamente correto e fiel a
referencia. Reutilize componentes existentes onde forem compativeis. Preserve
como `LOCAL_LAYOUT_INTERNO` os blocos que ainda nao possuem prova de
reutilizacao ou manutencao/variacao independente. Nao componentize a tela por
padrao e nao proponha componente local de library nesta fase.

Quando a referencia tiver componente local, ele pode ser copiado para dentro do
primeiro template somente para preservar a tela, sem virar ativo de library.
Para instancia, planeje usar a instancia canonica atual e reaplicar somente os
overrides explicitamente permitidos pelo contrato. Se isso nao puder reproduzir
a referencia, declare `IMPASSE_TECNICO`.

### Fase `EXTRACAO_SELETIVA`

Aceite esta fase somente depois de `TEMPLATE_PRIMEIRO` validado e de aprovacao
humana explicita para componentizar. Liste candidatas individualmente. Para cada
uma, comprove reutilizacao em pelo menos dois usos planejados ou necessidade de
manutencao/variacao independente. Extraia somente essas partes e recomponha uma
nova versao do template. Nunca exclua a versao anterior antes de nova aprovacao
humana.

### Regras de arquitetura

- Declare a arvore completa do template, os recursos da library e uma decisao
  `REUTILIZAR`, `CRIAR` ou `IMPASSE` para cada recurso necessario.
- Reutilize tokens e variaveis existentes, em especial tokens de cor. Nao crie
  token de cor que ja exista.
- Proponha variavel apenas para valor parametrizavel de cor, numero, texto ou
  booleano, quando o caso exigir variacao. Texto fixo nao precisa virar
  variavel; nao crie variavel para contexto ou ausencia de etapa.
- Declare bindings e estilos por propriedade, incluindo valores soltos aceitos
  excepcionalmente, justificativa e criterio de validacao.
- Preserve instancias opacas: nao planeje inserir filhos nelas. Use SlotNode
  somente se o contrato aprovado o declarar e o preflight o confirmar.
- Separe decisao tecnica de regra de negocio e deixe regra sem fonte como
  `[CONFIRMAR]`.

Conclua com `status: MAPA_TECNICO_PRONTO` e `gate: G_MAPA` somente se nao houver
impasse bloqueante.

## MODO: ENTREGAR_CONTRATO

Consolide o inventario e o mapa no JSON leve. Ele deve estar completo para a
tela, marcar `status: AGUARDANDO_APROVACAO_HUMANA` e
`gate: G_APROVACAO_TEMPLATE` na fase `TEMPLATE_PRIMEIRO`, ou
`G_APROVACAO_EXTRACAO` na fase `EXTRACAO_SELETIVA`. Nao autorize montagem ou
componentizacao. Mostre a pessoa apenas a proposta e a decisao requerida.

## MODO: REVISAR_IMPASSE

Reavalie somente o item devolvido pelo Montador ou Validador. Preserve o resto
do contrato, atualize impasse, recibos e evidencias afetadas. Se alterar mapa,
fase, candidate ou override permitido, retorne a `ENTREGAR_CONTRATO` e exija
nova aprovacao humana.

## Resposta obrigatoria

Responda somente no chat com linguagem operacional:

```markdown
## Progresso da rodada
- Tela selecionada:
- Fase:
- Status e gate:

## Achados e preservacoes

## Busca da library e decisoes tecnicas

## Proposta ou impasse

## Decisao humana necessaria

## Cartao de passagem
- Proxima acao permitida:
```

Em `INVENTARIAR`, a proxima acao e `ARQUITETAR`; em `ARQUITETAR`,
`ENTREGAR_CONTRATO`; em `ENTREGAR_CONTRATO`, somente aprovacao humana; em
`REVISAR_IMPASSE`, a proxima acao depende do delta. Nunca alegue validacao
Figma sem releitura independente do Validador.
