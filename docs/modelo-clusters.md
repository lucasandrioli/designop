# Modelo de dados: clusters como modes

Arquitetura central da biblioteca de templates do consignado. Toda
skill e agente do projeto segue este modelo.

## Estrutura

- A ETAPA e sempre o namespace logico: organiza pagina, referencias,
  templates, mapa e nomes de variavel. O nome Figma sempre preserva
  esse namespace, por exemplo `anuencia/orientacao/descricao`.
- A COLLECTION e uma decisao fisica de arquivo, registrada em
  `docs/topologia-biblioteca.md` antes do Montador escrever no Figma:
  pode ser uma collection unica, collections por etapa no mesmo
  arquivo, ou uma collection local em cada arquivo de etapa.
- Em qualquer topologia, CADA MODE E UM CLUSTER que realmente usa a
  etapa. Exemplo: `Gov SP`, `Cluster 4`. A ausencia da etapa nao cria
  mode nem boolean: vive no mapa de fluxo.
- Cada variavel e uma linha da tabela; cada celula e o valor daquele
  cluster naquela etapa. A etapa e definida UMA vez, com templates-base
  e bindings. Trocar o mode da instancia troca o conteudo do cluster.
  Um template especializado so existe quando a estrutura nao cabe no
  template-base.

## Mapeamento dos tipos de variacao

| Variacao entre clusters | Tipo | Binding |
| --- | --- | --- |
| Texto diferente | string | characters do TEXT |
| Elemento aparece/some | boolean | visible do no |
| Valor, limite, prazo | number | characters via formatacao, ou props numericas |
| Componente aberto/fechado (variant) | string | variant property (TESTAR via API; fallback: boolean em secao expandida) |
| Property de componente divergente | qualquer | BINDING NA PROPERTY: setProperties com VariableAlias (TEXT e BOOLEAN aceitam variavel direto) |

## Regras

- Modalidade (primeira concessao vs refinanciamento) NUNCA e mode:
  e estrutura de template separada.
- Texto identico em todos os clusters NAO vira variavel.
- Nomes de variavel: etapa/grupo/nome-kebab (ex:
  anuencia/orientacao/descricao,
  simulacao/elegibilidade/mostra-oferta-adicional). O namespace da
  etapa e sempre visivel, inclusive em arquivo ou collection dedicados.
- Nomes de mode: nome funcional do cluster, sem repetir a etapa (ex:
  Gov SP, Cluster 4).
- Todo texto bindado: fonte carregada antes do binding e textAutoResize
  HEIGHT ou WIDTH_AND_HEIGHT.
- Template-mestre nao pina mode de cluster. Durante a validacao, o
  mode explicito fica somente no wrapper de preview da pagina
  `_verificacao-<etapa>`. Depois da promocao, uma jornada montada em
  `Fluxos` tambem pode pinar o mode no seu frame de topo. O template
  nasce da arvore-alvo aprovada, nao de clone de referencia.
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

O limite de modes por collection depende do plano Figma da organizacao.
Antes de dimensionar a biblioteca, confirme o tier e teste criar,
publicar e consumir a quantidade real de modes necessaria. Uma chamada
da Plugin API que cria modes sem erro nao prova que a UI, a publicacao e
o consumo da biblioteca aceitarao a mesma quantidade.

Se o limite nao comportar todos os clusters, use uma das topologias
previstas em `docs/topologia-biblioteca.md` ou negocie o tier adequado.

## Os cinco eixos de variacao (normativos)

1. CLUSTER: conteudo por orgao. Mecanismo: variaveis com modes.
2. MODALIDADE: primeira concessao vs refinanciamento. Mecanismo:
   templates estruturalmente separados. Nunca mode, nunca boolean.
3. COMPOSICAO DE FLUXO: etapas que existem num cluster e nao noutro
   (ex: consentimento so no cluster 4; anuencia externa so em 4 e 2.1).
   Mecanismo: todos os templates de etapa existem na lib; um MAPA DE
   FLUXO POR CLUSTER (tabela markdown versionada em docs/, gerada pelo
   Analista) define a
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
da etapa, o mapa de fluxo e DERIVADO do grafo de navegacao pelo Analista,
nao escrito a mao:
- telas = nos; reactions NAVIGATE = arestas; flowStartingPoints
  nomeados = casos de uso
- caminho principal = cadeia a partir do starting point; tela com ida
  e volta ao no de origem = desdobramento (nivel 2)
- `setReactionsAsync` e `flowStartingPoints` sao os mecanismos usados
  para leitura e escrita desse grafo. Confirme-os na bateria de fumaca
  do ambiente antes da primeira montagem.
O mapa versionado no repo continua sendo a documentacao oficial; o
prototipo e a fonte de onde ele e gerado e contra a qual e conferido.

## Governanca do mapa e da collection

- O catalogo da etapa e a fonte unica da CAPACIDADE: casos de uso,
  templates-base, secoes compartilhadas e especializacoes aprovadas.
- O mapa de fluxo e a fonte unica de COMPOSICAO e SELECAO: quais
  etapas existem, em que ordem, em quais clusters e se usam padrao ou
  especializacao. Muda por PR no repo.
- A collection resolvida pela topologia e a fonte unica de CONTEUDO (o
  que cada tela mostra por cluster). Muda pela tabela de variaveis no
  Figma.
- Topologia fisica e pre-requisito do Montador, nao da analise. Com
  `docs/topologia-biblioteca.md` em `[DECIDIR]`, o Analista entrega
  proposta normalmente e o Montador para antes de
  escrever.
- NUNCA duplicar composicao como boolean de variavel (ex:
  fluxo/tem-consentimento). Verdade duplicada diverge.
- Populacao: o Analista gera inventario, grafo, pareamento, catalogo e
  classificacao em uma unica proposta. O designer aprova antes de
  qualquer escrita.
- Onboarding de cluster novo: (1) jornada no manual, (2) coluna no
  mapa, (3) mode na collection resolvida para cada etapa usada, (4)
  referencias nas paginas dessas etapas. Nada de duplicar etapa para
  dentro do cluster.

## Prova do fluxo designer no centro

O ciclo obrigatorio e: referencias cruas por cluster, comparacao,
schema aprovado, montagem do template e equivalencia por mode. As
referencias permanecem como contrato de validacao. A primeira execucao
no ambiente do banco registra essa evidencia no runbook da rodada.

## Listas com quantidade ou forma variavel por cluster

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

## Doutrina de binding

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
