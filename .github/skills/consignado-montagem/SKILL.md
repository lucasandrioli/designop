---
name: consignado-montagem
description: Monta templates aprovados de uma etapa a partir de referencias cruas, com variaveis, bindings, carimbo e protecao contra mode herdado. Exige aprovacao humana.
---

# Montagem de etapa

## Pre-requisitos obrigatorios

Antes de qualquer escrita no Figma, confirme e reporte todos os
bloqueios de uma vez:

1. A proposta consolidada foi aprovada explicitamente pelo designer na
   conversa atual.
2. Existem catalogo da etapa, mapa de fluxo e manual de cada cluster em
   `docs/`. `laboratorio/` nunca substitui esses documentos.
3. O arquivo Figma, a pagina da etapa e as secoes de referencia de cada
   cluster foram informados pelo designer.
4. A collection de conteudo foi encontrada ou a criacao de uma nova
   collection por dominio foi aprovada.

Sem um desses itens, pare. Nao crie tela, componente, variavel ou
binding para preencher lacuna.

## Ordem de montagem

1. Leia catalogo, mapa, manuais e proposta aprovada. A regra ativa de
   cada cluster precisa ter mecanismo classificado.
2. Localize ou crie a collection de conteudo do dominio. Cada mode e um
   cluster. Nunca crie collection por etapa ou por tela.
3. Crie somente as variaveis previstas no schema aprovado, com valores
   extraidos das referencias.
4. Clone a referencia indicada para o template. A referencia original
   permanece intacta.
5. Remova modes herdados do clone antes de componentizar.
6. Componentize primeiro secoes internas, depois template-base e por
   ultimo especializacoes aprovadas.
7. Binde conteudo property first e gere o carimbo com os bindings reais.
8. Crie previews e Fluxos com instancias dos templates. Aplique o mode
   somente no ancestral de cada preview ou caminho de fluxo.
9. Atualize documentos oficiais somente com o que foi aprovado e
   construido. Em seguida chame o Validador.

## Protecao contra mode herdado

Uma referencia de cluster pode ter um mode explicito preso no frame ou
em um descendente. Se esse mode viajar para o master, o template pode
parecer correto para o cluster de origem e ignorar todos os outros.

Depois de clonar e antes de componentizar, percorra o clone inteiro e
limpe o mode da collection de conteudo:

```js
for (const node of [clone, ...clone.findAll(() => true)]) {
  node.clearExplicitVariableModeForCollection(contentCollection)
}
```

Depois de componentizar, confirme que o master e todos os seus
descendentes tem `explicitVariableModes` vazio para essa collection.
Se encontrar um mode preso, pare e corrija antes de criar preview.

O template-mestre nunca recebe mode de cluster. Modes explicitos vivem
somente em wrappers de preview ou em frames de primeiro nivel da pagina
`Fluxos`.

## Binding e componente

- Property first: quando componente local ou IDS expuser TEXT ou
  BOOLEAN, use `setProperties` com `VariableAlias`.
- Texto local sem property exposta pode usar fallback no no de texto,
  com fonte carregada e `textAutoResize` HEIGHT ou WIDTH_AND_HEIGHT.
- Bindings de conteudo no master propagam. Nao corrija preview com
  override manual.
- Etapa presente ou ausente vem do mapa de fluxo, nunca de booleano.
- Cluster nao entra no nome do componente. Modalidade e estrutura,
  nunca mode.

## Carimbo e nomes

Nomeie `etapa/tpl-nome` somente depois de o objeto ser COMPONENT, ter
binding real da collection de conteudo e descricao completa.

O carimbo inclui etapa, modalidade, nivel, especializacao, clusters,
lista real de variaveis, estados, gatilho e fonte do mapa. Extraia a
lista de variaveis do Figma. Nao escreva de memoria.

## Prova antes de entregar

Para cada cluster selecionado no mapa:

1. Use preview sem override e aplique o mode no wrapper.
2. Compare textos e visibilidade com a referencia crua.
3. Rode `validateCreation` com `contentCollectionId`.
4. Reprove se o master tiver mode explicito da collection de conteudo.
5. Rode `validateLayout` no preview em cada mode.
6. Confirme que Fluxos instancia o template correto e que o grafo bate
   com o mapa.

## Saida

Primeiro entregue resumo simples: o que foi criado, se reproduziu cada
referencia e qualquer decisao pendente. Depois detalhe tecnico com node
IDs, collection, modes, bindings, validacoes e documentos alterados.
