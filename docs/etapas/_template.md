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

## Contrato de variaveis (proposto pelo Generalizador)

Nome e tipo, sem valores. Os valores sao definidos por mode na
collection de conteudo, apenas para clusters que usam o template.

| Variavel | Tipo | Obrigatoria quando | Observacao |
| --- | --- | --- | --- |
| <grupo/nome-kebab> | <string, boolean ou number> | <caso> | <n/a> |

## Comportamento de campo e estado de UI (extraido dos agentes)

Estados de UI sao variants ou properties, nunca modes de cluster. O
designer nao preenche uma especificacao visual aqui: o Leitor observa,
o Comparador evidencia e o Especializador classifica.

| Campo ou componente | Componente IDS | Estados possiveis | Regra |
| --- | --- | --- | --- |
| <nome> | <componente> | <lista> | [CONFIRMAR] |

## Historico
- <data>: <o que mudou, em qual template e por que>
