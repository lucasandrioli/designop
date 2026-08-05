# Operacao da Squad - preparo interno

## Objetivo

O Operador coordena leituras paralelas de duas ou tres etapas e entrega
um resumo unico para Kora. Nesta fase a squad so le documentos ja existentes.

## Limites

O Operador coordena leitores em paralelo e grava apenas o estado
temporario em `.designops/runs/`. Nem Operador nem Leitor escrevem no
Figma ou em documentos oficiais. Eles devolvem disponibilidade para Kora,
que decide se chama Analista ou se apresenta uma lacuna humana.

## Fluxo

1. Kora aciona o Operador quando a disponibilidade documental exigir preparo.
2. O Operador abre a rodada e chama um Leitor por etapa.
3. Cada Leitor recupera manual global, manual da modalidade, catalogo,
   mapa e manuais de contexto aplicaveis.
4. O Operador consolida disponibilidade, lacunas e proximo papel.
5. O Operador devolve a situacao para Kora; ele nunca inicia Figma, montagem
   ou promocao.

Um link Figma fica fora do preparo documental. Kora o preserva no recorte da
rodada e o entrega ao Analista somente quando a analise puder iniciar.
