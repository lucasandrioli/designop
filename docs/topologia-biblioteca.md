# Topologia da biblioteca Figma

Este documento registra como a biblioteca fica distribuida fisicamente
no Figma. Ele NAO muda o modelo de negocio: etapa continua sendo o
namespace logico, e cluster continua sendo o valor aplicado a ela.

## Decisao obrigatoria antes da montagem

Status atual: `[DECIDIR]`.

O Montador nao cria collection, variavel ou binding enquanto este
documento estiver em `[DECIDIR]`. Leitor, Comparador, Generalizador e
Especializador podem trabalhar normalmente, porque leem a etapa e suas
referencias, nao a topologia final.

## Modelo logico que nunca muda

Toda variavel recebe o namespace visivel da etapa, mesmo se a collection
ou o arquivo tambem ja a identificarem. Exemplo:

```text
anuencia/orientacao/descricao
anuencia/tutorial/passo-1/titulo
simulacao/oferta/valor-liberado
```

Assim, quem olha a tabela de variaveis sabe imediatamente a que etapa
pertence cada grupo, em qualquer topologia.

## Opcoes suportadas

| Topologia | Arquivos | Collections | Modes |
| --- | --- | --- | --- |
| `arquivo-unico/collection-unica` | Uma biblioteca com varias paginas de etapa | Uma collection, por exemplo `Conteudo` | Todos os clusters da biblioteca; a ausencia da etapa fica no mapa |
| `arquivo-unico/collections-por-etapa` | Uma biblioteca com varias paginas de etapa | Uma collection por etapa, por exemplo `Conteudo · Anuencia` | Somente os clusters que usam aquela etapa |
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
  convencao: <etapa/grupo/nome>
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
