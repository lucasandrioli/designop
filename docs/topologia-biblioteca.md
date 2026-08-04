# Topologia da biblioteca Figma

## Decisao obrigatoria

Status atual: `[DECIDIR]`. O Montador nao cria collection, variavel ou
binding enquanto este documento estiver pendente. O Analista pode
propor contrato sem escolher topologia.

## Convencao fisica

Cada modalidade possui sua collection de conteudo:

```text
Conteudo - <Modalidade>
```

As variaveis dessa collection usam:

```text
<etapa>/<tela>/<papel>
```

O mode e um contexto. Seu rotulo nao aparece nos caminhos de variavel.
Collections estruturais do IDS permanecem externas e podem coexistir
com a collection de conteudo da modalidade.

## Consumo

Quem consome cria uma Section `Jornada <Modalidade>`, aplica uma unica
collection de conteudo da modalidade e define o mode de contexto apenas
nela. Templates descendentes nao fixam mode. A escolha da modalidade
vem dos templates usados e da collection selecionada, nao de um mode.

O contrato de jornada declara explicitamente quais templates devem estar
presentes ou ausentes em cada contexto. Uma tela que deve estar ausente
nao pode permanecer na Section escondida por variavel booleana.

## Registro da decisao

```yaml
status: [DECIDIR|APROVADO]
arquivo: <nome ou link>
collections:
  - nome: Conteudo - <Modalidade>
    modalidade: <modalidade>
    caminho: <etapa>/<tela>/<papel>
idsEstruturais: <collections IDS permitidas>
aprovadoPor: <nome>
aprovadoEm: <data>
```
