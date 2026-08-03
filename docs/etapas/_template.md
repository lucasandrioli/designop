# Etapa: <nome>

Este e o catalogo canonico da etapa. Uma etapa representa uma capacidade
reutilizavel do produto, nao o comportamento de um cluster. Mudar a
definicao padrao aqui reflete em todo cluster que usa o template padrao.

Os manuais de cluster so dizem se usam a etapa e quais regras locais
justificam especializacoes. Valores por cluster vivem na collection do
Figma resolvida pela topologia; ordem, presenca e template selecionado
vivem no mapa de fluxo.

## Identificacao
- Nome da etapa: `<slug-da-etapa>`
- Objetivo: <capacidade entregue ao cliente>
- Modalidades aplicaveis: <lista explicita ou [CONFIRMAR]>
- Pagina Figma: `<nome da pagina da etapa>`

## Informacoes humanas minimas

<Explique somente o objetivo e as regras de negocio compartilhadas. No
modo /consignado-contexto, o Analista transforma sua explicacao em
rascunho para aprovacao antes de registrar este documento. Nao descreva
conteudo de tela, textos, campos, botoes, visibilidade ou template.
Essas evidencias sao extraidas pelos agentes da pagina Figma.>

## Chamadas na jornada

<A mesma etapa pode ser chamada mais de uma vez em momentos diferentes
da jornada. Registre aqui apenas a regra compartilhada; o mapa de fluxo
registra cada chamada, seu gatilho e seu caso de uso. Nao duplique a
etapa para representar recorrencia.>

## Inventario observado (preenchido pelo Analista)

Uma etapa e um conjunto de telas. O Analista extrai casos, telas,
prototipos e propriedades observadas da pagina Figma. O designer revisa
o inventario, mas nao o transcreve manualmente.

| Caso de uso | Nivel | Passos e fronteiras | Ponto de partida no Figma | Fonte da topologia | Status |
| --- | --- | --- | --- | --- | --- |
| <ex: caminho feliz> | 1 | <lista em ordem> | <nome real> | <prototipo, designer ou [VERIFICAR COM DESIGNER]> | [CONFIRMAR] |

Handoff e fronteira sao eventos de jornada, nao telas Figma. Quando uma
reacao de prototipo nao estiver disponivel, o caminho correspondente fica
`[VERIFICAR COM DESIGNER]`; ele nunca e inferido pela ordem dos frames.

## Telas da biblioteca

Uma tela da biblioteca tem nome curto, funcional e estavel. E o nome
usado no mapa, no contrato de conteudo e no template, mesmo que o frame
da referencia tenha sido nomeado de outro jeito.

Antes de preencher esta tabela, o Analista le `get_metadata`, as
reacoes do prototipo e `get_design_context` de pelo menos uma referencia
por familia de tela. `get_design_context` ajuda a reconhecer os papéis
e componentes usados; nao substitui mapa, manual ou revisao humana.

| Tela da biblioteca | ID curto | Frames de referencia pareados | Evidencia usada | Status |
| --- | --- | --- | --- | --- |
| <nome funcional> | `<id-curto>` | <frames encontrados> | <reacoes, contexto e estrutura> | [CONFIRMAR] |

## Escopo do contexto guiado

No primeiro registro, o documento para aqui. Template, IDS, variaveis,
properties, variants, especializacoes e contratos tecnicos pertencem a
`/consignado-analise`, em rodada posterior e somente leitura.

## Proposta de nucleo reutilizavel (preenchido pelo Analista)

### Templates-base

| Tela | Componente publicado | Referencias observadas | Status |
| --- | --- | --- | --- |
| <nome> | `<etapa>/tpl-<nome>` | <clusters, node IDs, data> | [PROPOSTO | APROVADO] |

### Secoes internas compartilhadas

| Secao | Componente interno | Reutilizada por |
| --- | --- | --- |
| <nome> | `_secoes/<nome>` | <templates> |

## Especializacoes estruturais aprovadas (propostas pelo Analista)

Use esta secao somente quando a diferenca nao couber em variavel,
property, variant ou mapa de fluxo. O nome e funcional, nunca o nome do
cluster. O mapa de fluxo escolhe onde cada especializacao e usada.

| ID | Motivo funcional | Template | Secoes compartilhadas | Status |
| --- | --- | --- | --- | --- |
| <ex: confirmacao-com-matricula> | <motivo> | `<etapa>/tpl-<nome>` | <lista> | [PROPOSTA | APROVADA] |

## Contrato de conteudo aprovado

O Analista propoe; o designer aprova antes da montagem. Este e o
contrato que diz **quais papeis realmente variam**. Nao e uma lista de
todos os textos da tela, nem um palpite do Validador. Valores por
cluster continuam apenas na collection do Figma resolvida para a etapa.

Registre um papel para cada conteudo que precisa responder ao mode. O
campo `type` usa os mesmos valores da interface: `text` exige variavel
`STRING`; `visible` exige `BOOLEAN`. O `alvo` descreve como o Montador
encontra o binding sem depender de node ID. Para uma property exposta
no COMPONENT ou COMPONENT_SET raiz, use `escopo: template`; para uma
property em componente aninhado ou binding interno, use `escopo: node`
e um nome de no unico. Um papel de visibilidade usa `campo: visible`.
Para `binding: node`, `text` usa obrigatoriamente `campo: characters`
e `visible` usa `campo: visible`. Para `component-property`, a property
exposta precisa ser `TEXT` ou `BOOLEAN`, respectivamente.

Toda `variavel` precisa comecar com `<tela>/` quando a collection for da
propria etapa, e representar o papel de negocio daquela tela. Em
collection compartilhada, use `<etapa>/<tela>/`. Nunca reutilize
`prop/*`, `teste-*`, collection de laboratorio ou variavel de outra
etapa so porque o tipo ou o valor coincide. Quando o binding direto no no ainda precisar ser exercitado
num arquivo real, registre `prova-de-montagem: true`; o Analista propoe,
mas somente o Montador prova isso em `_verificacao-<etapa>`.

```yaml
collection: <nome da collection resolvida para esta etapa>
papeis:
  - id: <titulo>
    tela: <id curto da tela da biblioteca>
    variavel: <tela/papel-kebab>
    type: <text | visible>
    prova-de-montagem: <true | false>
    binding:
      tipo: <component-property | node>
      alvo:
        escopo: <template | node>
        nome: <obrigatorio somente no escopo node>
      property: <nome da property, quando houver>
      campo: <characters | visible, quando binding for node>
```

O Montador traduz esse contrato para `validateContentContract` usando
`collectionId`, `id`, `variavel`, `type`, `binding.kind`,
`target.scope`, `target.nodeName` e `field`. O Validador usa os mesmos
`id` e `type` em `validateModeBehavior` e passa todos os papeis
aprovados em `expectedRoles`. Se o papel ainda nao foi aprovado, marque
`[CONFIRMAR]`; nao o inclua como obrigatorio no teste.

## Contrato tecnico de reconstrucao aprovado

Esta secao nasce na proposta do Analista e e registrada pelo Montador
somente depois da aprovacao humana unica. Ela nao redescreve regra de
negocio nem guarda node IDs permanentes. Ela transforma a referencia em
uma prova deterministica para que a arvore nova possa ser melhor que a
arvore antiga sem mudar o resultado visivel.

Uma referencia define aparencia e comportamento. O contrato abaixo diz
como provar isso: cada papel e unico, a arvore-alvo define pai e ordem,
o mapa IDS define o que vem da biblioteca e a geometria compara caixas
relativas ao frame raiz. A referencia continua sendo evidencia visual,
nao molde de camadas.

```yaml
templates:
  - id: <tela-ou-papel>
    componente: <etapa>/tpl-<nome>
    status: <APROVADO>
    tolerancia-px: 2
    viewport:
      superficie: mobile
      largura: 360
      altura: 800
    prototipo:
      overflow-direction: <NONE | HORIZONTAL | VERTICAL | HORIZONTAL_AND_VERTICAL>
      filhos-fixos: [<nomes unicos, na ordem em que aparecem no final da tela>]
    referencias:
      - cluster: <cluster>
        papel-raiz: <tela>
        origem: <nome do frame de referencia, sem node ID>
        seletores-geometricos: <nomes observados para esse cluster>
    arvore:
      - papel: <tela>
        alvo: { raiz: true }
        referencia: { raiz: true }
        tipo: COMPONENT
        origem: local-layout
        layout:
          modo: VERTICAL
          padding: [<top>, <right>, <bottom>, <left>]
          gap: <numero>
      - papel: <acao-primaria>
        alvo: { nome: <nome unico no rascunho> }
        referencia: { nome: <nome observado na referencia> }
        pai: <tela>
        ordem: <indice a partir de zero>
        tipo: INSTANCE
        origem: ids-instance
        ids:
          component-key: <key real>
          properties: [<property publica>]
      - papel: <bloco-local>
        alvo: { nome: <nome unico no rascunho> }
        referencia: { nome: <nome observado na referencia> }
        pai: <tela>
        ordem: <indice a partir de zero>
        tipo: FRAME
        origem: local-layout
        excecao-local-aprovada: true
        tokens:
          - campo: <itemSpacing | paddingTop | fills/...>
            variavel: <nome real do token IDS>
            # ou, somente quando aprovado:
            literal-aprovado: <valor>
```

`origem` aceita `ids-instance`, `local-layout`, `local-component`,
`text` ou `asset`. `local-component` exige `excecao-local-aprovada`.
Componente IDS sem property ou slot suficiente fica `[CONFIRMAR]` ou
`SEM_EQUIVALENTE` na proposta, nunca e contornado silenciosamente.
Token manual que tenha equivalente exato no IDS precisa virar binding;
literal so e permitido quando estiver declarado e aprovado.

O Validador traduz este contrato para
`validateReconstructionContract`. Ele devolve tres blocos: arvore,
geometria e IDS. Aprovacao exige os tres sem achado, alem das validacoes
de conteudo, mode, layout e screenshot.

Na chamada do script, `papel`, `alvo`, `referencia`, `pai`, `tipo`,
`origem` e `excecao-local-aprovada` viram, respectivamente, `id`,
`target`, `reference`, `parent`, `type`, `source` e `localException`.
`nome` vira `nodeName`; `raiz: true` permanece `root: true`. Assim o
catalogo continua legivel e o script recebe chaves estaveis.
`viewport.superficie`, `viewport.largura` e `viewport.altura` viram
`viewport.surface`, `viewport.width` e `viewport.height`.

Arvore e IDS sao auditados uma vez no rascunho. Geometria e rodada uma
vez por cluster, com `geometryCandidateId` apontando para a instancia no
preview daquele mode. Quando a referencia usa nome diferente para o
mesmo papel, o Montador passa o seletor daquele cluster em
`reference` ou `geometryTarget`, sem alterar a arvore-alvo aprovada.
`literal-aprovado` vira `approvedLiteral` no script.

Para `superficie: mobile`, o viewport-base global e obrigatoriamente
`360 x 800`, conforme [Viewport-base](../viewport-base.md). O Analista
preenche esses valores sem perguntar. Um tamanho diferente exige uma
excecao explicita do designer no contrato tecnico.

`prototipo` e opcional. Ele e usado somente quando a referencia ou o
designer declarar comportamento de rolagem ou elementos fixos. Por
exemplo, uma tela mobile pode declarar `overflow-direction: VERTICAL` e
`filhos-fixos: [rodape-fixo]`. Isto nao transforma rodape fixo em regra
geral: apenas torna verificavel a escolha daquela tela. O Montador
traduz essas chaves para `prototype.overflowDirection` e
`prototype.fixedChildren` no `validateReconstructionContract`.

## Contrato de interacao aprovado

Este contrato descreve somente o comportamento que a tela precisa ter
no prototipo. A referencia normalmente prova origem e destino. Quando
ela nao registrar movimento, o designer pode informar na conversa o
gatilho, atraso, transicao, duracao e Bezier. Registre os valores
literais recebidos, sem procurar documento remoto e sem substituir por
um preset parecido.

`duration` e medida em segundos no contrato do Plugin API. `timeout` do
gatilho `AFTER_TIMEOUT` e medido em milissegundos. Deixe esses campos
ausentes quando nao forem parte do comportamento aprovado.

```yaml
perfis-de-movimento:
  - id: <saida-padrao>
    gatilho:
      tipo: <ON_CLICK | AFTER_TIMEOUT>
      timeout: <milissegundos, somente AFTER_TIMEOUT>
    transicao:
      tipo: <DISSOLVE | SMART_ANIMATE | PUSH | ...>
      duracao: <segundos>
      easing:
        tipo: <EASE_OUT | CUSTOM_CUBIC_BEZIER | ...>
        bezier: { x1: <numero>, y1: <numero>, x2: <numero>, y2: <numero> }

reacoes:
  - no: <nome unico da acao ou frame>
    esperado: <destination | back | any>
    destino: <nome da tela de destino, quando houver>
    perfil-de-movimento: <saida-padrao>
  - no: <acao com movimento proprio>
    esperado: <destination | back | any>
    destino: <nome da tela de destino, quando houver>
    gatilho: { tipo: <ON_CLICK | AFTER_TIMEOUT>, timeout: <milissegundos> }
    transicao:
      tipo: <DISSOLVE | SMART_ANIMATE | PUSH | ...>
      duracao: <segundos>
      easing:
        tipo: <EASE_OUT | CUSTOM_CUBIC_BEZIER | ...>
        bezier: { x1: <numero>, y1: <numero>, x2: <numero>, y2: <numero> }
```

Use um perfil para uma regra agrupada e cite o perfil em cada acao que
ela cobre. Uma acao pode ter movimento proprio, mas nao pode combinar
perfil e valores locais. O Montador traduz `perfis-de-movimento` para
`motionProfiles` e `perfil-de-movimento` para `motionProfile` no
`validateInteractionContract`. Para uma regra local, ele traduz `no`,
`esperado`, `destino`, `gatilho.tipo`, `gatilho.timeout`,
`transicao.tipo`, `transicao.duracao` e `transicao.easing.bezier` para
`name`, `expected`, `destinationName`, `trigger.type`,
`trigger.timeout`, `transition.type`, `transition.duration` e
`transition.easing.cubicBezier`.

## Comportamento de campo e estado de UI (extraido dos agentes)

Estados de UI sao variants ou properties, nunca modes de cluster. O
designer nao preenche uma especificacao visual aqui: o Analista observa,
evidencia e classifica antes da aprovacao humana.

| Campo ou componente | Componente IDS | Estados possiveis | Regra |
| --- | --- | --- | --- |
| <nome> | <componente> | <lista> | [CONFIRMAR] |

## Historico
- <data>: <o que mudou, em qual template e por que>
