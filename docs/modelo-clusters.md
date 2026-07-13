# Modelo de dados: clusters como modes

Arquitetura central da biblioteca de templates do consignado. Toda
skill e agente do projeto segue este modelo.

## Estrutura

- UMA collection de variaveis por dominio de conteudo (ex:
  `conteudo-consignado`), onde CADA MODE E UM CLUSTER:
  cluster-1-mg, cluster-2, cluster-2-1, cluster-4-federais, cluster-5
- Cada variavel e uma linha da tabela; cada celula e o valor daquela
  variavel naquele cluster.
- A tela template e construida UMA vez, com bindings. Trocar o mode da
  instancia troca o cluster inteiro.

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
- Validacao obrigatoria EM CADA MODE (validateLayout por mode via
  setExplicitVariableModeForCollection): texto que cabe num cluster
  pode estourar em outro.

## Limite de plano (checar no banco)

Modes por collection dependem do plano Figma. Professional: 4.
Enterprise: 40. Cinco clusters exigem plano com 5+ modes; confirmar o
plano da org antes de apresentar a proposta.

## Os quatro eixos de variacao (normativos)

1. CLUSTER: conteudo por orgao. Mecanismo: variaveis com modes.
2. MODALIDADE: primeira concessao vs refinanciamento. Mecanismo:
   templates estruturalmente separados. Nunca mode, nunca boolean.
3. COMPOSICAO DE FLUXO: etapas que existem num cluster e nao noutro
   (ex: consentimento so no cluster 4; anuencia externa so em 4 e 2.1).
   Mecanismo: todos os templates de etapa existem na lib; um MAPA DE
   FLUXO POR CLUSTER (tabela markdown versionada em docs/, gerada e
   atualizada pelo inventario, com diagrama opcional) define a
   sequencia. Mode controla conteudo; mapa controla sequencia.
4. ESTADO DE UI: variacao por acao do usuario dentro da tela (oferta
   adicionada/removida, efetivacao aguardando anuencia/confirmada,
   item de resumo aberto/fechado). Mecanismo: variants ou properties
   do componente/template. NUNCA modes. Estado de UI em mode de
   cluster e defeito de arquitetura.

## Mapa de fluxo: colunas obrigatorias

etapa | nivel de navegacao (1 = obrigatoria no fluxo; 2 = opcional,
alcancavel do nivel 1) | presenca por cluster | gatilho (para nivel 2
condicional, ex: detalhe do seguro obrigatorio se cliente remove a
oferta) | template correspondente na lib

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

Quando as telas de referencia estao conectadas por prototipo (o que o
designer ja faz naturalmente), o mapa de fluxo e DERIVADO do grafo de
navegacao pelo inventario (modo fluxos), nao escrito a mao:
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

- O mapa de fluxo e a fonte unica de COMPOSICAO (quais etapas, em que
  ordem, em quais clusters). Muda por PR no repo.
- A collection e a fonte unica de CONTEUDO (o que cada tela mostra por
  cluster). Muda pela tabela de variaveis no Figma.
- NUNCA duplicar composicao como boolean de variavel (ex:
  fluxo/tem-consentimento). Verdade duplicada diverge.
- Populacao: o inventario gera o rascunho do mapa (Passo 7) e semeia os
  valores das variaveis (Passo 5); designers validam; manutencao segue
  por PR (mapa) e edicao de tabela (variaveis).
- Onboarding de cluster novo: (1) coluna no mapa, (2) mode na
  collection, (3) preencher celulas das variaveis. Nada de duplicar
  arquivo.

## Prova de conceito do fluxo designer-no-centro (lab)

Ciclo validado de ponta a ponta em laboratorio: referencias cruas por
cluster construidas pelo designer -> comparador achou 5/5 divergencias
plantadas sem falso positivo (17 textos) -> schema aprovado (6
variaveis) -> variabilizador bindou template clonado da referencia ->
teste de equivalencia matematico passou nos 2 modes (16/16 e 17/17
textos). As referencias permanecem como contrato de validacao.

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
  VARIA_ESTRUTURA, tratada como estrutura separada e documentada.

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
