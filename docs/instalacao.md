# Instalacao: o que precisa existir antes de um agente rodar

Este documento responde: o que precisa estar pronto para analisar e
construir UMA ETAPA reutilizavel? O repositorio comeca vazio de conteudo
de negocio. Os agentes nao inventam regra que nao esteja escrita.

## Kit minimo

Para o primeiro ciclo completo, escolha uma etapa e dois clusters que a
usem. Voce precisa de:

1. Ambiente Figma conectado e bateria de fumaca aprovada.
2. Catalogo da etapa em `docs/etapas/<etapa>.md`.
3. Manual de cada cluster em `docs/clusters/`, somente com a jornada e
   regras que tocam a etapa escolhida.
4. Mapa de fluxo do escopo, que pode comecar como rascunho.
5. Uma pagina Figma da etapa, com uma secao `_ref-<cluster>` por
   cluster e referencias cruas para todos os casos de uso no escopo.
6. Prototipo ligado e flow starting point nomeado em cada caso que
   tenha duas ou mais telas.
7. Arquivo consumidor separado do IDS, bibliotecas IDS habilitadas e
   `docs/topologia-biblioteca.md` decidido. A collection de conteudo e
   seus modes sao criados pelo Montador conforme essa topologia.
8. Aprovacao humana unica da proposta do Analista: arvore-alvo, mapa
   IDS, variaveis, geometria e excecoes locais.

Nenhum arquivo de exemplo substitui esses itens.

## Conhecimento que o humano registra

| Artefato | Dono | O que responde |
| --- | --- | --- |
| Catalogo da etapa | produto + designer | qual capacidade, casos, telas e nucleo compartilhado existem |
| Manual do cluster | produto + juridico | se o cluster usa a etapa e qual regra local justifica diferenca |
| Mapa de fluxo | designer, derivado do prototipo | ordem, presenca, caso de uso e template selecionado por cluster |

O manual do cluster nao e um documento de tela. Ele nunca repete a
definicao da etapa. `[CONFIRMAR]` e melhor que uma justificativa
inventada.

## Pagina Figma da etapa

Exemplo para `Anuencia`:

```text
Anuencia
  _ref-c1-mg
    Caso feliz: telas conectadas
    Excecao: telas conectadas
  _ref-c4-federais
    Caso feliz: telas conectadas
    Excecao: telas conectadas
  _templates
    resultados aprovados pelo Montador

_verificacao-anuencia
  _rascunho-anuencia-<tela>
  preview-<cluster>-<template>

Fluxos (somente quando solicitado depois da aprovacao)
  jornadas completas feitas com instancias de tpl-*
```

As referencias permanecem cruas e intactas. Os prototipos dentro da
pagina descrevem a navegacao interna da etapa e sao a fonte do mapa.
`_verificacao-anuencia` e uma pagina temporaria do Montador: guarda
rascunhos e previews sem conexoes, nunca referencias ou templates
aprovados. A pagina `Fluxos` so e criada ou atualizada depois de um
pedido explicito, com instancias de templates ja aprovados.

## Ordem de execucao

```text
designer prepara pagina da etapa + documentos minimos
    v
/consignado-analise: inventario, matriz, nucleo, mecanismos,
arvore-alvo, IDS e geometria propostos
    v
designer aprova a proposta consolidada
    v
topologia da biblioteca decidida
    v
/montador: registra o contrato aprovado e constroi a arvore-alvo,
componentes, variaveis, bindings e previews em _verificacao-<etapa>
    v
/validador: contrato, IDS, geometria, equivalencia, mapa, catalogo,
layout e revisao visual
    v
/montador: promocao para tpl-*, carimbo final e limpeza dos previews
    v
publicacao manual da biblioteca
```

`Fluxos` nao entra nessa cadeia automaticamente. Ele e uma operacao
posterior e explicita, quando os templates de todas as etapas que
aparecem naquela jornada ja estiverem aprovados.

O Analista e somente leitura. Nenhuma proposta autoriza escrita sozinha.
O Montador para se nao houver aprovacao explicita do designer.

## Crescimento

- Novo cluster: manual com a jornada, referencias nas paginas das
  etapas usadas, coluna no mapa e mode na collection resolvida para
  cada etapa. Nunca copie uma etapa para dentro do cluster.
- Nova etapa: novo catalogo, pagina Figma e primeiro conjunto de
  referencias. Ela so entra em jornadas depois de estar no mapa.
- Diferenca estrutural: o Analista propoe um template funcional
  separado. Ele precisa estar no catalogo da etapa e selecionado pelo
  mapa antes de o Montador construir.
