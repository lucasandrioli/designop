# Operacao da Squad - Fase 0

## Objetivo

O Operador coordena leituras paralelas de duas ou tres etapas e entrega
um resumo unico. Nesta fase a squad so le documentos ja existentes.

## Limites

O Operador coordena leitores em paralelo e grava apenas o estado
temporario em `.designops/runs/`. Nem Operador nem Leitor escrevem no
Figma ou em documentos oficiais. Eles nao iniciam Analista, Montador ou
Validador automaticamente.

## Fluxo

1. O designer informa as etapas ao Operador.
2. O Operador abre a rodada e chama um Leitor por etapa.
3. Cada Leitor recupera manual global, manual da modalidade, catalogo,
   mapa e manuais de contexto aplicaveis.
4. O Operador consolida disponibilidade, lacunas e proximo papel.
5. A rodada termina em `concluida` ou `aguardando_designer`.

Um link Figma fica fora da Fase 0. O designer o fornece novamente ao
Analista quando iniciar a analise.
