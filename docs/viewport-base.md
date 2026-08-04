# Viewport-base

## Regra global

Todo template mobile deste projeto nasce no viewport-base de `360 x 800`.
Ele e a medida comum para referencia normalizada, rascunho, preview e
validacao. Nao e uma regra de negocio nem uma propriedade de contexto.

## Comportamento esperado

- A raiz mobile tem largura `360` e altura `800`.
- Conteudo maior que a area visivel usa rolagem vertical quando o
  contrato daquela tela a declarar.
- Elementos fixos, como rodape, CTA ou acao flutuante, so existem quando
  forem observados ou aprovados para aquela tela. Eles nao sao uma
  consequencia automatica do viewport mobile.
- O contrato registra a direcao de rolagem e os filhos fixos. O
  Validador confere esses dados somente quando estiverem declarados.
- Uma referencia humana pode ter outro tamanho. O Analista a preserva
  como evidencia e normaliza a arvore-alvo para `360 x 800`; ele nao
  pergunta sobre essa conversao.

## Outras superficies

Desktop, tablet ou outro formato nao sao mobile ampliado. Cada superficie
nova precisa de um viewport-base declarado neste documento antes de
entrar em montagem ou validacao.

## Excecoes

Uma tela pode usar tamanho diferente apenas se o designer a declarar
explicitamente como excecao no contrato tecnico. Sem essa declaracao, o
Montador usa `360 x 800` e o Validador reprova outro tamanho.
