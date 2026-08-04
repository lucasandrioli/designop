# Estrutura da biblioteca Figma

## Publicacao

Templates publicados seguem modalidade antes de etapa:

```text
<modalidade>/<etapa>/tpl-<tela>
```

Especializacoes estruturais acrescentam apenas um nome funcional ao
template. Nenhum nome publicado recebe rotulo ou identificador de
contexto.

| Objeto | Convencao | Publicado |
| --- | --- | --- |
| Template | `<modalidade>/<etapa>/tpl-<tela>` | sim |
| Componente local | `_componentes-locais/<dominio>/<nome>` | nao |
| Rascunho | `_rascunho-<modalidade>-<etapa>-<tela>` | nao |
| Referencia crua | `ref-<modalidade>-<tela>-<contexto-id>` | nao |
| Preview | `preview-<contexto-id>-<modalidade>-<etapa>-tpl-<tela>` | nao |
| Section de jornada | `Jornada <Modalidade>` | nao |

Barra organiza componentes no painel de assets. Referencias cruas nao
recebem barra e preservam o `contexto-id` como evidencia.

## Espacos do arquivo

1. Pagina da etapa: referencias cruas separadas dos templates aprovados.
2. `_verificacao-<etapa>`: rascunhos, previews temporarios e uma area
   interna chamada `_componentes-locais` para componentes locais ainda
   nao publicados.
3. `Fluxos`: demonstracao opcional posterior, somente com instancias de
   templates aprovados.

Rascunhos, previews e referencias nunca sao assets publicados. A
promocao remove previews da rodada e preserva evidencia no relatorio do
Validador.

## Checklist antes de publicar a library

A Plugin API nao demonstra de forma confiavel se um componente esta
oculto da publicacao da library. Antes de publicar, uma pessoa confirma
no Figma que toda a area `_componentes-locais` permanece interna. O
Validador registra este item como checklist humano e nunca como prova
automatizada.

## Prefixo tpl-

Um asset so recebe `tpl-` depois de ser COMPONENT ou COMPONENT_SET,
possuir bindings de conteudo reais ou declaracao de conteudo invariavel,
ter carimbo e receber veredito favoravel do Validador.

O carimbo deve registrar etapa, modalidade, nivel, especializacao,
variaveis reais, estados e origem do mapa. Ele nao registra contexto.

## Contratos executaveis

Cada tela e cada jornada possuem um contrato logico em
`docs/contratos/`. O contrato registra papeis semanticos, fontes de
composicao, viewport, comportamento de rolagem, interacoes, presenca por
contexto e selecao de template. Ele nao guarda node IDs permanentes.

Em uma rodada, `.designops/runs/<rodada>/resolvido.json` associa os IDs
logicos do contrato aos IDs atuais do Figma. O mesmo diretorio contem
`componentes-locais.json`, com a decisao aprovada de reutilizacao. Assim,
scripts verificam o arquivo real sem transformar documentos oficiais em
uma lista fragil de IDs.
