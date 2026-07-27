# Modelo de dados: clusters como modes

Arquitetura central da biblioteca de templates do consignado. Toda
skill e agente do projeto segue este modelo.

## Estrutura

- UMA collection de variaveis por dominio de conteudo (ex:
  `conteudo-consignado`), onde CADA MODE E UM CLUSTER:
  cluster-1-mg, cluster-2, cluster-2-1, cluster-4-federais, cluster-5
- Cada variavel e uma linha da tabela; cada celula e o valor daquela
  variavel naquele cluster.
- A etapa e definida UMA vez, com templates-base e bindings. Trocar o
  mode da instancia troca o conteudo do cluster. Um template
  especializado so existe quando a estrutura nao cabe no template-base.

## Mapeamento dos tipos de variacao

| Variacao entre clusters | Tipo | Binding |
| --- | --- | --- |
| Texto diferente | string | characters do TEXT |
| Elemento aparece/some | boolean | visible do no |
| Valor, limite, prazo | number | characters via formatacao, ou props numericas |
| Componente aberto/fechado (variant) | string | variant property (TESTAR via API; fallback: boolean em secao expandida) |
| Property de componente divergente | qualquer | BINDING NA PROPERTY: setProperties com VariableAlias (TEXT e BOOLEAN aceitam variavel direto; validado no teste 9) |

## Regras

- Modalidade (primeira concessao vs refinanciamento) NUNCA e mode:
  e estrutura de template separada.
- Texto identico em todos os clusters NAO vira variavel.
- Nomes de variavel: grupo/nome-kebab (ex: orgao/nome-exibicao,
  elegibilidade/mostra-oferta-adicional).
- Nomes de mode: cluster-N-apelido.
- Todo texto bindado: fonte carregada antes do binding e textAutoResize
  HEIGHT ou WIDTH_AND_HEIGHT.
- Template-mestre nao pina mode de cluster. O mode explicito fica no
  wrapper de preview ou no frame de Fluxos. Ao clonar referencia para
  montar template, limpe modes herdados do clone e seus descendentes.
- Validacao obrigatoria EM CADA MODE (validateLayout por mode via
  setExplicitVariableModeForCollection): texto que cabe num cluster
  pode estourar em outro.

## Contrato de conteudo e prova de comportamento

Cada etapa aprovada declara em `docs/etapas/<etapa>.md` somente os
papeis de conteudo que devem variar por cluster. Cada papel aponta para
uma variavel da collection, seu tipo e seu mecanismo de binding. `text`
exige variavel Figma `STRING`; `visible` exige `BOOLEAN`. Exemplo de
papel: `titulo`, `descricao`, `cta` ou `mostrar-aviso`. O Validador nao
deduz esses papeis observando a tela: se nao constarem no contrato, a
ausencia e `[CONFIRMAR]`, nao um erro inventado.

A prova tem duas camadas independentes:

1. **Contrato de conteudo:** `validateContentContract` verifica, papel
   por papel, se o alvo declarado esta ligado a variavel declarada. Um
   token de cor, tipografia ou espacamento vindo do IDS nunca satisfaz
   essa prova.
2. **Comportamento por mode:** `validateModeBehavior` recebe previews
   ja construidos e a lista completa de papeis `{ id, type }` do
   contrato.
   Confirma o mode somente no wrapper, reprova o mesmo mode em qualquer
   descendente, reprova override manual na instancia, exige todos e
   somente os papeis aprovados, compara cada valor efetivo com a
   referencia do cluster e chama `validateLayout` dentro do wrapper. A
   estrutura do template continua sendo responsabilidade de
   `validateCreation`.

O schema aprovado define os papeis; o mapa define quais clusters usam
o template; as referencias cruas definem o resultado esperado. Nenhuma
dessas tres verdades e substituida por booleano ou por inspecao visual.

## Limite de plano (checar no banco)

Modes por collection dependem do plano Figma. Professional: 4.
Enterprise: 40. Cinco clusters exigem plano com 5+ modes; confirmar o
plano da org antes de apresentar a proposta.

Teste feito em 2026-07-25 no lab (conta pessoal, time em tier Pro):
`addMode` criou 8 modes numa collection SEM lancar erro. Ou seja, a
Plugin API nao aplica o limite documentado — o que significa que
"funcionou via API" NAO e evidencia de que o plano suporta. A restricao
pode estar na UI, no publish da biblioteca ou no consumo pelo arquivo
cliente, nao no `addMode`. CONCLUSAO PRATICA: nao confie neste teste
para dimensionar o plano do banco; a verificacao real e (a) qual tier a
org tem e (b) criar 5+ modes numa collection, PUBLICAR e consumir num
segundo arquivo — o teste completo so acontece no ambiente do banco
(item novo para docs/runbook-banco.md). Se o plano travar em 4 modes com
5+ clusters, o eixo 1 (cluster = mode) precisa de plano B: dividir em
mais de uma collection por grupo de clusters, ou negociar o tier.

## Os cinco eixos de variacao (normativos)

1. CLUSTER: conteudo por orgao. Mecanismo: variaveis com modes.
2. MODALIDADE: primeira concessao vs refinanciamento. Mecanismo:
   templates estruturalmente separados. Nunca mode, nunca boolean.
3. COMPOSICAO DE FLUXO: etapas que existem num cluster e nao noutro
   (ex: consentimento so no cluster 4; anuencia externa so em 4 e 2.1).
   Mecanismo: todos os templates de etapa existem na lib; um MAPA DE
   FLUXO POR CLUSTER (tabela markdown versionada em docs/, gerada pelo
   Leitor e revisada pelo Comparador) define a
   sequencia. Mode controla conteudo; mapa controla sequencia.
4. ESTADO DE UI: variacao por acao do usuario dentro da tela (oferta
   adicionada/removida, efetivacao aguardando anuencia/confirmada,
   item de resumo aberto/fechado). Mecanismo: variants ou properties
   do componente/template. NUNCA modes. Estado de UI em mode de
   cluster e defeito de arquitetura.
5. ESPECIALIZACAO ESTRUTURAL: diferenca de uma etapa que nao cabe em
   conteudo, property, variant ou composicao. Mecanismo: template
   especializado com nome funcional, registrado no catalogo da etapa e
   selecionado no mapa de fluxo. Nunca nomear o template com o cluster.

## Mapa de fluxo: colunas obrigatorias

etapa/tela | caso de uso | nivel de navegacao (1 = obrigatoria no
fluxo; 2 = opcional, alcancavel do nivel 1) | gatilho | selecao por
cluster (`nao`, `padrao` ou `especializacao:<id>`)

## Logica condicional explicita

Regras de estado que cruzam selecao e conteudo DEVEM ser escritas como
tabela de decisao no repo antes da construcao. Exemplo normativo, o
totalizador da simulacao (variant property Selecao):

| Selecao | Label | Valor |
| --- | --- | --- |
| ambos | Juros nessa condicao | taxa com desconto + original tachada |
| so-portabilidade | Juros reduzidos pela portabilidade | idem |
| so-seguro | Juros reduzidos pelo seguro | idem |
| nenhum | Juros | taxa cheia, sem tachado |

Textos de cada variant podem adicionalmente ser bindados em variaveis
de cluster (cruzamento eixo 1 x eixo 4). Agentes nao inferem essas
regras: elas vem da tabela.

## Prototipo como fonte do mapa

Quando as telas de referencia estao conectadas por prototipo na pagina
da etapa, o mapa de fluxo e DERIVADO do grafo de navegacao pelo Leitor
e revisado pelo Comparador, nao escrito a mao:
- telas = nos; reactions NAVIGATE = arestas; flowStartingPoints
  nomeados = casos de uso
- caminho principal = cadeia a partir do starting point; tela com ida
  e volta ao no de origem = desdobramento (nivel 2)
- validado em lab: setReactionsAsync e flowStartingPoints funcionam
  por API para leitura e escrita; deteccao de nivel 2 e de divergencia
  de conteudo em desdobramento comprovada sem falso positivo
O mapa versionado no repo continua sendo a documentacao oficial; o
prototipo e a fonte de onde ele e gerado e contra a qual e conferido.

## Governanca do mapa e da collection

- O catalogo da etapa e a fonte unica da CAPACIDADE: casos de uso,
  templates-base, secoes compartilhadas e especializacoes aprovadas.
- O mapa de fluxo e a fonte unica de COMPOSICAO e SELECAO: quais
  etapas existem, em que ordem, em quais clusters e se usam padrao ou
  especializacao. Muda por PR no repo.
- A collection e a fonte unica de CONTEUDO (o que cada tela mostra por
  cluster). Muda pela tabela de variaveis no Figma.
- NUNCA duplicar composicao como boolean de variavel (ex:
  fluxo/tem-consentimento). Verdade duplicada diverge.
- Populacao: Leitor gera o rascunho do grafo, Comparador registra o
  pareamento, Generalizador propoe o catalogo e Especializador propoe
  a classificacao. O designer aprova antes de qualquer escrita.
- Onboarding de cluster novo: (1) jornada no manual, (2) coluna no
  mapa, (3) mode na collection, (4) referencias nas paginas das etapas
  usadas. Nada de duplicar etapa ou arquivo.

## Prova de conceito anterior do fluxo designer-no-centro (lab)

Ciclo validado de ponta a ponta em laboratorio antes da cadeia atual:
referencias cruas por cluster construidas pelo designer -> comparador
achou 5/5 divergencias plantadas sem falso positivo (17 textos) ->
schema aprovado (6 variaveis) -> montador bindou template clonado da
referencia -> teste de equivalencia matematico passou nos 2 modes
(16/16 e 17/17 textos). As referencias permanecem como contrato de
validacao.

## Listas com quantidade ou forma variavel por cluster (decisao do teste 4)

- QUANTIDADE: slots + booleans. O template nasce com os slots do maior
  caso atual; cada slot tem mostrar (boolean) e conteudo (strings) por
  mode. O teto NAO e premissa: o Revisor alerta quando um convenio
  ocupa o ultimo slot, e adicionar slot e operacao de rotina do
  Montador (edicao de master, propaga a todos).
- NATUREZA: secao polimorfica. Quando a mesma informacao aparece em
  formas diferentes por convenio (lista num, stepper noutro), as
  formas coexistem no template, cada uma com boolean de visibilidade
  por mode. Exatamente uma forma visivel por mode (o Revisor valida
  a exclusividade).
- ORDEM: fixa entre convenios, por principio de consistencia de
  produto (decisao do designer). Booleans nao reordenam; ordem
  divergente seria VARIA_ESTRUTURA e exigiria justificativa no manual
  do convenio.
- Alem disso: divergencia mais profunda que quantidade+forma =
  ESPECIALIZACAO ESTRUTURAL. Ela exige template funcional separado,
  registro no catalogo da etapa e selecao explicita no mapa.

## Doutrina de binding (hierarquia, definida no teste 9)

1. PROPERTY PRIMEIRO: se o componente expoe property (TEXT/BOOLEAN),
   binde a variavel de cluster NA PROPERTY via setProperties +
   createVariableAlias. E a API publica do componente: sobrevive a
   refatoracao interna do IDS e respeita o contrato do design system.
2. NO INTERNO como fallback: override em no interno (setBoundVariable
   no texto) apenas quando o componente NAO expoe property para aquele
   conteudo. Registrar no carimbo como binding de fallback, pois quebra
   se o IDS refatorar a estrutura interna.
3. setProperties aceita lote (10+ properties numa chamada): o Montador
   dirige componentes densos em uma operacao.
