# Topologia da biblioteca Figma

Este documento registra como a biblioteca fica distribuida fisicamente
no Figma. Ele NAO muda o modelo de negocio: etapa continua sendo o
namespace logico, e cluster continua sendo o valor aplicado a ela.

## Decisao obrigatoria antes da montagem

Status atual: `[DECIDIR]`.

O Montador nao cria collection, variavel ou binding enquanto este
documento estiver em `[DECIDIR]`. O Analista pode trabalhar normalmente,
porque le a etapa e suas referencias, nao a topologia final.

## Convencao de nomes de variavel

O primeiro grupo e sempre a tela da biblioteca. Quando a collection ja
pertence a uma unica etapa, nao repita a etapa no nome da variavel:

```text
<tela>/<papel>
```

Em collection compartilhada por varias etapas, acrescente a etapa antes
da tela:

```text
<etapa>/<tela>/<papel>
```

Nome de frame de referencia nao determina esse caminho. O Analista
registra primeiro qual e a tela da biblioteca e o Montador usa esse
nome aprovado para criar as variaveis.

## Opcoes suportadas

| Topologia | Arquivos | Collections | Modes |
| --- | --- | --- | --- |
| `arquivo-unico/collection-unica` | Uma biblioteca com varias paginas de etapa | Uma collection, por exemplo `Conteudo` | Todos os clusters da biblioteca; a ausencia da etapa fica no mapa |
| `arquivo-unico/collections-por-etapa` | Uma biblioteca com varias paginas de etapa | Uma collection por etapa, por exemplo `Conteudo · <Etapa>` | Somente os clusters que usam aquela etapa |
| `arquivo-por-etapa` | Um arquivo de biblioteca para cada etapa | `Conteudo` local de cada arquivo | Somente os clusters que usam aquela etapa |

Em qualquer opcao, um mode nunca carrega o nome da etapa. Nenhum
cluster sem a etapa ganha mode so para representar ausencia: ausencia
pertence ao mapa de fluxo.

## Registro da decisao

Preencher e aprovar antes do primeiro Montador em arquivo nao
descartavel:

```yaml
topologia: <arquivo-unico/collection-unica | arquivo-unico/collections-por-etapa | arquivo-por-etapa>
arquivos:
  - etapa: <slug ou todas>
    figma: <link ou file key>
collection:
  convencao: <Conteudo | Conteudo · <Etapa>>
variaveis:
  convencao: <tela/papel ou etapa/tela/papel em collection compartilhada>
decidido-por: <nome>
data: <aaaa-mm-dd>
```

## Regras de transicao

- Trocar de uma topologia para outra e uma migracao planejada, nunca
  uma decisao tomada durante a montagem de uma tela.
- O Montador primeiro le este documento e localiza a collection
  correspondente. Se ela nao existir, pede aprovacao para cria-la.
- O Validador recebe a `collectionId` efetiva do arquivo atual. A
  regra de equivalencia por mode continua a mesma nas duas topologias.
