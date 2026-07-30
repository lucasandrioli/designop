---
name: figma-reconstrucao
description: Procedimento Figma para transformar uma referencia em contrato tecnico aprovado, resolver componentes IDS, montar uma arvore-alvo e auditar a reconstrucao. Use com Analista, Montador e Validador.
---

# Reconstrucao Figma

Esta skill transforma as regras de baixo nivel de `figma-plugin-api` em
um procedimento de reconstrucao. Ela nao substitui a Plugin API. Antes de
todo `use_figma`, carregue tambem `figma-plugin-api` e a skill MCP
`figma-use` quando ela estiver disponivel no ambiente.

Use a rotina adequada ao papel atual. Analista apenas inspeciona e
resolve IDS. Montador pode montar apenas depois da aprovacao. Validador
apenas audita.

## 1. `inspecionarReferencia` (leitura)

Recebe um frame de referencia e extrai fatos, sem copiar sua arvore:

- hierarquia, ordem e caixas dos elementos visiveis;
- Auto Layout, sizing, padding, gap e sobreposicoes;
- textos, visibilidade, bindings e modes existentes;
- instancias IDS, `mainComponent.key`, properties publicas e
  `detachedInfo`;
- componentes locais, valores manuais e assets visuais.

Rotule cada bloco por papel semantico, por exemplo `cabecalho`,
`orientacao`, `acao-primaria` e `rodape`. O papel precisa ser unico no
template proposto. A arvore observada nao vira arvore-alvo por inercia.

## 2. `resolverIDS` (leitura)

Para cada papel da arvore-alvo, consulte primeiro as bibliotecas
conectadas e depois pesquise por funcao semantica nas bibliotecas de
componentes, tokens, icones e ilustracoes. Nao percorra uma biblioteca
inteira por tentativa e erro.

Para um candidato, confira key real, properties publicas, variants e
capacidade de composicao. Instancia remota e opaca: nao existe "colocar
um texto dentro" se o componente nao expuser slot ou property. Classifique:

- `EXATO`: key, property ou token e uso conferidos;
- `[CONFIRMAR]`: dois candidatos adequados, token apenas parecido ou
  composicao ainda nao comprovada;
- `SEM_EQUIVALENTE`: nenhum componente ou token IDS atende ao papel.

`SEM_EQUIVALENTE` vira uma excecao local proposta, nunca um componente
inventado. Token com o mesmo numero em escopo diferente nao e exato.

## 3. `montarArvore` (escrita exclusiva do Montador)

Exige contrato tecnico aprovado e topologia resolvida. Antes de criar,
confira novamente as keys e properties do mapa IDS. Pare diante de
`[CONFIRMAR]`, `SEM_EQUIVALENTE` sem excecao aprovada ou componente sem
slot necessario.

1. Trabalhe somente em `_verificacao-<etapa>`.
2. Crie a arvore-alvo com containers locais, Auto Layout, sizing, gaps,
   padding e sobreposicoes declarados no contrato.
3. Importe componentes IDS pela key real e use somente properties
   publicas. Nunca anexe filho dentro de instancia remota.
4. Crie componente ou secao local somente quando a excecao aprovada
   declarar esse papel.
5. Clone referencia somente quando o contrato aprovar um asset visual
   especifico. Nunca clone a tela inteira como ponto de partida do
   template.
6. Crie previews sem reactions em `_verificacao-<etapa>`; mode fica
   apenas no wrapper.

## 4. `auditarReconstrucao` (leitura)

Validador roda `validateReconstructionContract` junto das validacoes
existentes. A auditoria compara papéis, nao a arvore interna suja da
referencia:

- arvore-alvo: pai, ordem, tipo, composicao e sobreposicao declarada;
- geometria relativa ao frame raiz: x, y, largura e altura, com
  tolerancia documentada;
- IDS: key real, properties, token ou literal aprovado, nenhum
  destacado ou componente local nao autorizado;
- conteudo e modos nos scripts ja existentes;
- screenshots da referencia, rascunho e previews como revisao visual
  obrigatoria, nunca como unico criterio de aprovacao.

Sem screenshot, o resultado e `NAO VERIFICAVEL`. Imagem ajuda a achar
algum contrato incompleto, mas o veredito nao pode depender de o modelo
achar que duas telas parecem semelhantes.
