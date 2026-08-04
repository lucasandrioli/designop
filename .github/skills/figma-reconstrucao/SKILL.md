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

## Contratos e evidencias

O contrato de tela define viewport, rolagem, rodape fixo, papeis,
origens de composicao e interacoes. O contrato de jornada define
collection, mode de contexto, presenca e ausencia de templates. Ambos
usam IDs logicos. Node IDs do arquivo ficam apenas em
`.designops/runs/<rodada>/resolvido.json`.

O Analista coleta estrutura e reacoes antes de propor o contrato. O
Montador roda `validateRound.js` e `validateCompositionContract.js`
antes de escrever. O Validador repete as coletas e devolve
`NAO VERIFICAVEL` se o Figma divergir da evidencia do Analista.

## 0. `prepararReconstrucao` (leitura obrigatoria)

Antes de qualquer escrita, trabalhe a partir do link do frame exato, nao
do link do arquivo inteiro. O Montador confirma este pre-voo a partir da
proposta aprovada; nao o refaz por intuicao.

1. Leia a referencia e ao menos uma tela comparavel que ja use o IDS.
   Use `get_design_context` em uma referencia representativa para
   reconhecer componentes, properties e papeis de interface. O objetivo
   e descobrir componentes reais em uso, nao reproduzir a arvore de
   nenhuma delas. Nome livre do frame nao define a tela da biblioteca.
2. Comece por cada instancia IDS ja usada na referencia. Recupere sua
   `mainComponent.key`, pesquise uma vez o nome exato do componente para
   descobrir a `libraryKey` e registre a fonte. Pode haver varias fontes
   confirmadas na rodada, como componentes, icones, tokens e ilustracoes.
   Nas buscas seguintes, use `includeLibraryKeys` somente com a chave da
   fonte pertinente. Nao chame `get_libraries` nesta etapa normal.
3. So sem instancia remota ou candidato semantico suficiente use
   `get_libraries` como ultimo recurso. Leia somente
   `libraries_added_to_file`; ignore `libraries_available_to_add` e nao
   percorra catalogos de bibliotecas disponiveis.
4. Para cada papel de interface, resolva antes de escrever: componente,
   `key`, variant, properties publicas, token e escopo aplicavel. Primeiro
   procure a instancia ja usada em uma tela; busca de biblioteca vem
   depois, apenas para o que permanecer sem equivalente.
5. Entregue um mapa curto com cada papel como `EXATO`,
   `PROVA_DE_MONTAGEM`, `SEM_EQUIVALENTE` ou `[CONFIRMAR]`. O mapa entra
   no contrato aprovado. Um `EXATO` informa biblioteca, key real,
   property ou variant e node de evidencia. Nao ha escrita se restar um
   item ambiguo.
6. Defina a unidade de montagem: um rascunho ou uma secao interna por
   vez, sempre dentro de `_verificacao-<etapa>`. Nunca crie elementos
   soltos na pagina nem mova filhos entre wrappers em chamadas diferentes.

Esse pre-voo e tecnico. Ele nao pede regras de negocio ao designer: usa
catalogo, mapa e manuais ja aprovados. So interrompe para uma decisao que
nenhuma leitura do Figma ou documento consegue resolver.

Asset proprietario obrigatorio ausente nao e `SEM_EQUIVALENTE` e nao
autoriza frame substituto. Ele bloqueia a tela dependente ate o ativo
aprovado ficar disponivel.

## 1. `inspecionarReferencia` (leitura)

Recebe um frame de referencia e extrai fatos, sem copiar sua arvore:

- hierarquia, ordem e caixas dos elementos visiveis;
- Auto Layout, sizing, padding, gap e sobreposicoes;
- textos, visibilidade, bindings e modes existentes;
- instancias IDS, `mainComponent.key`, properties publicas e
  `detachedInfo`;
- componentes locais, valores manuais e assets visuais.

Rotule cada bloco por papel semantico, por exemplo `cabecalho`,
`conteudo-principal`, `acao-primaria` e `rodape`. O papel precisa ser unico no
template proposto. A arvore observada nao vira arvore-alvo por inercia.

## 2. `resolverIDS` (leitura)

Para cada papel da arvore-alvo, comece por uma instancia remota usada na
referencia. Recupere `mainComponent.key`, pesquise uma vez o nome exato
para obter sua `libraryKey` e restrinja as consultas seguintes com
`includeLibraryKeys`. Construa um conjunto de bibliotecas confirmadas da
rodada, pois componentes, tokens, icones e ilustracoes podem ter fontes
diferentes. Nao percorra uma biblioteca inteira por tentativa e erro.

`get_libraries` e ultimo recurso, somente quando a referencia nao tiver
instancia remota nem candidato semantico suficiente. Mesmo nesse caso,
consuma apenas `libraries_added_to_file` e descarte
`libraries_available_to_add` sem pesquisar seu catalogo.

Para um candidato, confira key real, properties publicas, variants e
capacidade de composicao. Instancia remota e opaca: nao existe "colocar
um texto dentro" se o componente nao expuser slot ou property. Classifique:

- `EXATO`: key, property ou token e uso conferidos;
- `PROVA_DE_MONTAGEM`: a leitura confirma que o mecanismo e permitido
  pela API, mas o efeito depende de uma escrita real no arquivo, por
  exemplo binding de `visible` diretamente em uma INSTANCE remota;
- `[CONFIRMAR]`: dois candidatos adequados, token apenas parecido ou
  composicao ainda nao comprovada;
- `SEM_EQUIVALENTE`: nenhum componente ou token IDS atende ao papel.

Antes de classificar um componente como `EXATO`, execute
`scripts/inspectRemoteComponent.js` com a key, `assetType` e `libraryKey`
da rodada. Os tres campos sao obrigatorios. A prova confirma a importacao no arquivo atual e as properties
publicas sem depender de key antiga ou leitura direta de variante.

`SEM_EQUIVALENTE` vira uma excecao local proposta, nunca um componente
inventado. Token com o mesmo numero em escopo diferente nao e exato.

O Analista pode propor `PROVA_DE_MONTAGEM`, mas nunca executa essa
prova, nem de forma temporaria ou com reversao. O contrato precisa dizer
qual papel sera provado, qual mecanismo sera exercitado e qual resultado
e esperado. `PROVA_DE_MONTAGEM` nao e uma regra de negocio em aberto:
depois da aprovacao humana, ela pertence exclusivamente ao Montador.
Ela exige que a divergencia correspondente ja esteja justificada no
manual do contexto. Um papel marcado `[CONFIRMAR]` nao pode receber
`PROVA_DE_MONTAGEM` no mesmo contrato.

## 3. `provarMecanismo` (escrita exclusiva do Montador)

Use esta rotina somente para cada `PROVA_DE_MONTAGEM` que constar no
contrato aprovado. Ela acontece antes do rascunho completo e nunca em
uma referencia.

1. Trabalhe apenas em `_verificacao-<etapa>` e crie um objeto temporario
   com nome `_prova-<papel>`.
2. Use somente a variavel semantica ja aprovada para a tela da
   biblioteca. Em collection por etapa ela segue `<tela>/<papel>`;
   em collection compartilhada, `<etapa>/<tela>/<papel>`. Nunca
   reutilize `prop/*`, `teste-*` ou uma collection de laboratorio para
   provar uma regra de negocio.
3. Exercite o mecanismo declarado. Para visibilidade de uma INSTANCE,
   o binding pode ser aplicado diretamente no no INSTANCE quando nao
   houver property publica de visibilidade. Isso nao autoriza editar
   filhos internos da instancia remota.
4. Leia o resultado em chamada separada. Em Auto Layout vertical,
   confirme tambem que o item oculto nao deixa espaco morto.
5. Registre sucesso ou falha no relatorio da rodada e remova somente o
   objeto temporario. Se a variavel semantica tiver sido criada somente
   para esta prova que falhou, remova-a tambem; nunca remova variavel que
   ja existia. Se falhar, nao inicie o rascunho completo: devolva a
   pendencia ao designer e ao Analista.

Uma prova bem-sucedida libera apenas o mecanismo que foi aprovado. Ela
nao permite trocar componente, criar nova variavel ou ampliar a arvore
alvo por conta propria.

## 4. `montarArvore` (escrita exclusiva do Montador)

Exige contrato tecnico aprovado e topologia resolvida. Antes de criar,
confira novamente as keys e properties do mapa IDS. Pare diante de
`[CONFIRMAR]`, `SEM_EQUIVALENTE` sem excecao aprovada ou componente sem
slot necessario.

1. Confirme que `prepararReconstrucao` foi concluido e que o mapa IDS da
   proposta nao contem lacunas. Trabalhe somente em
   `_verificacao-<etapa>`.
2. Crie primeiro o wrapper do rascunho. Depois construa uma secao por
   chamada, diretamente dentro dele. Nao construa secoes soltas para
   reparentar depois.
3. Crie a arvore-alvo com containers locais, Auto Layout, sizing, gaps,
   padding e sobreposicoes declarados no contrato.
4. Importe componentes IDS pela key real e use somente properties
   publicas. Nunca anexe filho dentro de instancia remota.
5. Crie componente ou secao local somente quando a excecao aprovada
   declarar esse papel.
6. Clone referencia somente quando o contrato aprovar um asset visual
   especifico. Nunca clone a tela inteira como ponto de partida do
   template.
7. Depois de cada secao, faca uma leitura separada e screenshot do bloco
   criado. Corrija somente o bloco com problema antes de iniciar o
   seguinte. Screenshot e evidencia visual, nao substituto do contrato
   deterministico.
8. Crie previews sem reactions em `_verificacao-<etapa>`; mode fica
   apenas no wrapper.

### Rodape fixo em frame rolavel

Em uma tela mobile cujo contrato declare rodape fixo, a raiz usa
`overflowDirection = 'VERTICAL'` e `numberOfFixedChildren`. Essa
propriedade pertence a raiz e fixa os ultimos filhos dela, na ordem da
arvore. A API so aceita definir o numero depois que todos esses filhos
ja foram anexados. Portanto: crie conteudo, progresso e CTA primeiro;
so entao defina `numberOfFixedChildren = 2`. Nunca procure um booleano
`fixed` no botao ou no progresso, pois essa propriedade nao existe no
filho.

## 5. `auditarReconstrucao` (leitura)

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
