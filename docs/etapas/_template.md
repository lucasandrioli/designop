# Etapa: <nome>

Este e o catalogo canonico da etapa. Uma etapa representa uma capacidade
reutilizavel do produto, nao o comportamento de um cluster. Mudar a
definicao padrao aqui reflete em todo cluster que usa o template padrao.

Os manuais de cluster so dizem se usam a etapa e quais regras locais
justificam especializacoes. Valores por cluster vivem na collection do
Figma; ordem, presenca e template selecionado vivem no mapa de fluxo.

## Identificacao
- Nome da etapa: `<slug, ex: anuencia>`
- Objetivo: <capacidade entregue ao cliente>
- Modalidade: <primeira concessao | refin | ambas>
- Pagina Figma: `<nome da pagina da etapa>`

## Informacoes humanas minimas

<Escreva somente o objetivo e as regras de negocio compartilhadas. Nao
descreva conteudo de tela, textos, campos, botoes, visibilidade ou
template. Essas evidencias sao extraidas pelos agentes da pagina Figma.>

## Inventario observado (preenchido pelo Leitor)

Uma etapa e um conjunto de telas. O Leitor extrai casos, telas,
prototipos e propriedades observadas da pagina Figma. O designer revisa
o inventario, mas nao o transcreve manualmente.

| Caso de uso | Nivel | Telas | Ponto de partida no Figma | Status |
| --- | --- | --- | --- | --- |
| <ex: caminho feliz> | 1 | <lista em ordem> | <nome real> | [CONFIRMAR] |

## Proposta de nucleo reutilizavel (preenchido pelo Generalizador)

### Templates-base

| Tela | Componente publicado | Referencias observadas | Status |
| --- | --- | --- | --- |
| <nome> | `<etapa>/tpl-<nome>` | <clusters, node IDs, data> | [PROPOSTO | APROVADO] |

### Secoes internas compartilhadas

| Secao | Componente interno | Reutilizada por |
| --- | --- | --- |
| <nome> | `_secoes/<nome>` | <templates> |

## Especializacoes estruturais aprovadas (propostas pelo Especializador)

Use esta secao somente quando a diferenca nao couber em variavel,
property, variant ou mapa de fluxo. O nome e funcional, nunca o nome do
cluster. O mapa de fluxo escolhe onde cada especializacao e usada.

| ID | Motivo funcional | Template | Secoes compartilhadas | Status |
| --- | --- | --- | --- | --- |
| <ex: confirmacao-com-matricula> | <motivo> | `<etapa>/tpl-<nome>` | <lista> | [PROPOSTA | APROVADA] |

## Contrato de conteudo aprovado

O Generalizador propoe; o designer aprova antes da montagem. Este e o
contrato que diz **quais papeis realmente variam**. Nao e uma lista de
todos os textos da tela, nem um palpite do Validador. Valores por
cluster continuam apenas na collection do Figma.

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

```yaml
collection: <nome da collection de conteudo>
papeis:
  - id: <titulo>
    variavel: <grupo/nome-kebab>
    type: <text | visible>
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

## Comportamento de campo e estado de UI (extraido dos agentes)

Estados de UI sao variants ou properties, nunca modes de cluster. O
designer nao preenche uma especificacao visual aqui: o Leitor observa,
o Comparador evidencia e o Especializador classifica.

| Campo ou componente | Componente IDS | Estados possiveis | Regra |
| --- | --- | --- | --- |
| <nome> | <componente> | <lista> | [CONFIRMAR] |

## Historico
- <data>: <o que mudou, em qual template e por que>
