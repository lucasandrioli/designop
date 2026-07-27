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

`laboratorio/` pode mostrar formato, mas nunca substitui esses itens.

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
```

As referencias permanecem cruas e intactas. Os prototipos dentro da
pagina descrevem somente a navegacao interna da etapa. A pagina
`Fluxos` conecta instancias de templates para mostrar a jornada completa
de cada cluster.

## Ordem de execucao

```text
designer prepara pagina da etapa + documentos minimos
    v
/leitor: inventario de fatos e grafos
    v
/comparador: matriz de divergencias verificaveis
    v
/generalizador: nucleo e templates-base propostos
    v
/especializador: mecanismos e especializacoes propostos
    v
designer aprova a proposta consolidada
    v
topologia da biblioteca decidida
    v
/montador: componentes, variaveis, bindings e carimbo
    v
/validador: equivalencia, mapa, catalogo e layout
    v
publicacao manual da biblioteca
```

Os quatro primeiros agentes sao somente leitura. Nenhum resultado deles
autoriza escrita sozinho. O Montador para se nao houver aprovacao
explicita do designer.

## Crescimento

- Novo cluster: manual com a jornada, referencias nas paginas das
  etapas usadas, coluna no mapa e mode na collection resolvida para
  cada etapa. Nunca copie uma etapa para dentro do cluster.
- Nova etapa: novo catalogo, pagina Figma e primeiro conjunto de
  referencias. Ela so entra em jornadas depois de estar no mapa.
- Diferenca estrutural: o Especializador propoe um template funcional
  separado. Ele precisa estar no catalogo da etapa e selecionado pelo
  mapa antes de o Montador construir.
