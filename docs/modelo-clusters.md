# Modelo de dados: contextos como modes

Esta e a doutrina normativa de variacao da biblioteca.

## Base documental e rodadas

O `master` contem os manuais-base aprovados de produto, modalidade,
etapa e contexto. Eles registram fonte, aprovador, data e lacunas. Uma
rodada nasce do `master` com esse conhecimento, mas sem referencias Figma,
node IDs, manifestos, contratos ou mapa concreto.

Mapas pertencem a worktrees de rodada porque unem as regras da base a
referencias atuais e a caminhos observados. Regra ausente ou divergente
na rodada permanece `[CONFIRMAR]` e vira proposta para `/consignado-base`;
ela nao atualiza a base automaticamente.

## Eixos de variacao

| Eixo | Mecanismo | Fonte de verdade |
| --- | --- | --- |
| Modalidade | Templates separados e collection propria | Mapa da modalidade e Figma |
| Contexto | Modes da collection de conteudo | Manual de contexto e Figma |
| Composicao da jornada | Presenca e caminho no mapa | `docs/mapas/<modalidade>.md` |
| Confirmacao externa dentro de Formalizacao | Presenca e contrato de retorno no mapa | Mapa, catalogo da etapa e manual de contexto |
| Estado de UI | Properties ou variants | Contrato da tela |
| Diferenca estrutural | Template funcional especializado | Contrato e mapa |

Etapa e uma capacidade reutilizavel definida uma vez. Modalidade nunca
e mode. Ausencia de etapa nunca vira boolean de variavel.

## Hierarquia documental

Cada decisao de negocio deve aparecer em uma camada somente:

| Camada | Documento | Responsabilidade |
| --- | --- | --- |
| Produto | `docs/manual-credito-consignado.md` | regras que valem para todo credito consignado |
| Modalidade | `docs/modalidades/<modalidade>.md` | estrutura, restricoes e eventos da modalidade |
| Etapa | `docs/etapas/<etapa>.md` | capacidade reutilizavel, telas e contratos comuns |
| Contexto | `docs/contextos/<contexto-id>.md` | excecoes e regras locais aprovadas |
| Jornada | `docs/mapas/<modalidade>.md` | composicao concreta de etapas, telas e caminhos |

O mapa referencia as quatro camadas anteriores. Ele nao duplica suas
regras: apenas registra onde cada regra se aplica na jornada.

## Confirmacao externa dentro de Formalizacao

Uma confirmacao externa pode ser uma composicao interna de
Formalizacao. Ela nao e uma etapa canonica por si so. O mapa registra
se ela esta presente e como a jornada retorna ao app:

| Contrato de retorno | Significado |
| --- | --- |
| `DIRETO` | Ao retornar, a jornada continua para a proxima tela interna prevista. |
| `ACAO_NO_APP` | Ao retornar, a pessoa precisa concluir uma acao interna antes de a jornada seguir. |

O numero de acoes, canais ou verificacoes fora do app nao cria novas
etapas, templates ou modos. Isso e regra local do contexto, registrada
no respectivo manual e evidenciada nas referencias externas. Somente um
novo comportamento de retorno pode exigir nova tela ou nova composicao
no contrato aprovado.

Quando a composicao tiver orientacao, o mapa tambem declara seu roteiro:
somente caminho direto ou caminho direto com tutorial opcional. O
tutorial e um caminho alternativo de ajuda e converge para o mesmo
handoff externo. Ele nao e uma etapa canonica e nao e consequencia
automatica da quantidade de acoes externas.

Os contratos logicos de tela e jornada ficam em `docs/contratos/`. Eles
descrevem a estrutura verificavel sem repetir regra de negocio nem
registrar IDs permanentes do Figma.

## Contextos

Contexto e o identificador generico de um mode. Cada contexto recebe um
`contexto-id` estavel, como `ctx-05`, e possui manual correspondente em
`docs/contextos/<contexto-id>.md`.

O manual e a unica fonte de regras locais. Ele pode registrar um rotulo
de negocio mutavel, mas este rotulo nao entra em asset publicado,
componente local, template, collection, variavel ou caminho de
variavel. Referencias cruas e mapas usam o `contexto-id` para manter
rastreabilidade mesmo que o rotulo mude.

## Collections e variaveis

Cada modalidade recebe uma collection de conteudo:

```text
Conteudo - <Modalidade>
```

Dentro dela, todo caminho segue:

```text
<etapa>/<tela>/<papel>
```

O caminho nunca inclui modalidade, rotulo ou identificador de contexto.
Uma Section de jornada aplica um mode de conteudo uma unica vez e seus
templates descendentes herdam esse mode. Collections estruturais do IDS,
como cor, espacamento e tipografia, podem coexistir nessa Section.

Tipografia estrutural nao e conteudo por contexto. Um Text Style ou uma
variavel tipografica do IDS pode usar modes estruturais, como tema, sem
violar a regra de mode de contexto. A proibicao recai somente sobre o mode da
collection `Conteudo - <Modalidade>` em template ou descendente.

## Selecionar o mecanismo correto

| Diferenca observada | Mecanismo |
| --- | --- |
| Texto ou visibilidade por contexto | Variavel de conteudo e mode |
| Estado acionado pela pessoa usuaria | Property ou variant |
| Etapa ou tela presente em um caminho | Mapa da jornada |
| Estrutura reutilizavel em duas ou mais ocorrencias aprovadas | Componente local interno |
| Estrutura de uma unica ocorrencia | `local-layout` no template |
| Estrutura que difere entre modalidades | Template separado por modalidade |

IDS e a fonte unica para componentes existentes. Um componente local
exige evidencia contratual aprovada de reutilizacao em pelo menos duas
telas ou casos de uso antes de ser criado.

## Contrato de conteudo

Cada papel variavel do contrato declara variavel, tipo e alvo de
binding. `text` exige STRING; `visible` exige BOOLEAN. Tokens
estruturais do IDS nao satisfazem a prova de conteudo.

O Validador confere separadamente o contrato de conteudo, a heranca de
mode, a ausencia de mode explicito em descendentes, a geometria e a
equivalencia visual com a referencia do contexto.
