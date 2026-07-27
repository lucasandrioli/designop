# Padroes comuns (extraidos pelo aprendiz)

Observado em: ref-simulacao/c1-mg e ref-simulacao/c4-federais
(lab, 2 telas). Confianca: BAIXA (poucas amostras). Refinar com as
telas reais do banco.

## Anatomia base de tela (2/2 telas)
- Frame raiz: 360 de largura, layoutMode VERTICAL, sizing FIXED/FIXED,
  gap 0, sem padding. O padding vive nas secoes, nao na raiz.
- Nivel 1 (filhos diretos da raiz), nesta ordem:
  1. header-fluxo (instancia IDS), FILL horizontal
  2. corpo (frame proprio), FILL horizontal
  3. [componentes de rodape fixo, ex: totalizador], FILL
  4. acao-rodape (frame proprio), FILL

## Secao "corpo" (2/2)
- Frame proprio, VERTICAL, FILL horizontal, HUG vertical
- gap 24, padding [24, 16, 24, 16]
- Contem as instancias de conteudo, todas FILL horizontal

## Secao "acao-rodape" (2/2)
- Frame proprio, HORIZONTAL, FILL horizontal, HUG vertical
- gap 0, padding [12, 16, 12, 16]
- Contem o botao primario, FILL horizontal

## Nomenclatura observada
- Frames proprios: minusculo, sem barra ("corpo", "acao-rodape")
- Instancias renomeadas pelo PAPEL, nao pelo componente
  ("oferta-seguro", "oferta-portabilidade" em vez de "item-lista")

## Regra derivada (a confirmar)
Todo conteudo dentro do corpo e FILL horizontal. Nenhuma instancia
observada com largura fixa.
