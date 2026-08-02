# Observacoes de montagem

Registro de achados operacionais para incorporar nos agentes e nas skills.
Este documento nao e fonte de regra de negocio, de etapa ou de convenio.

## Incorporado nesta rodada

### Viewport-base mobile

- Origem: normalizacao das etapas Anuencia e Simulacao.
- Regra incorporada: toda tela mobile nasce em `360 x 800`. Isso define
  o quadro de validacao, nao se a tela tem ou nao rodape fixo.
- Verificacao: `validateReconstructionContract.js` confere o viewport
  declarado no contrato tecnico. Desktop e outra superficie terao
  viewport-base proprio quando entrarem no escopo.

### Tela mobile com rodape fixo

- Origem: montagem da pagina Simulacao.
- Achado: uma coluna unica deixa o CTA e o totalizador soltos no meio da
  tela quando o conteudo varia.
- Regra incorporada: somente quando o contrato tecnico da tela declarar
  rolagem e filhos fixos, o Montador separa `conteudo-rolavel` e
  `rodape-fixo`. Para Simulacao, o contrato tambem indica o totalizador
  imediatamente acima da acao primaria, quando houver totalizador.
- Verificacao: `validateReconstructionContract.js` confere direcao da
  rolagem, quantidade e ordem dos filhos fixos, alem dos papeis,
  geometria e IDS. Isto e um padrao declarado de Simulacao, nao uma
  regra universal.

### Navegacao de tutorial mobile

- Origem: referencias da etapa Anuencia.
- Achado: `tutorial-1` a `tutorial-4` possuem indicador de progresso e
  uma acao de avancar ou sair para o canal externo. Empilha-los junto ao
  conteudo deixa uma area vazia e perde a navegacao ao rolar.
- Regra incorporada: quando o Analista identificar esse par semantico em
  uma tela de tutorial mobile, ele o registra como navegacao fixa no
  contrato, sem perguntar pela altura da tela. O conteudo instrucional
  permanece na area rolavel. Nomes concretos dos filhos fixos continuam
  no contrato de cada tela.
- Verificacao: `validateReconstructionContract.js` confere os filhos
  finais fixos declarados. A regra nao se aplica a CTAs comuns de outras
  telas, que continuam dependendo de evidencia ou de decisao aprovada.

### Caminhos secundarios reais

- Origem: montagem da pagina Simulacao.
- Achado: valores, parcelas e produtos opcionais precisam levar a telas de
  edicao ou detalhes, e nao apenas aparecer como blocos estaticos.
- Regra a incorporar: o Leitor inventaria reacoes; o Analista preserva os
  caminhos paralelos no mapa; o Montador cria as reacoes aprovadas; o
  Validador verifica destino e retorno de cada acao.
- Verificacao esperada: cada elemento interativo tem uma reacao, um destino
  valido e uma forma de retorno quando a jornada continuar na mesma tela.

### Organizacao da pagina Figma

- Origem: montagem da pagina Simulacao.
- Achado: secoes largas e masters posicionados na mesma coordenada tornam a
  pagina dificil de ler e escondem problemas de estrutura.
- Regra a incorporar: antes de escrever, o Montador define caixas sem
  intersecao para referencias, telas auxiliares, verificacao e componentes
  locais. Nenhum master pode ocupar a mesma coordenada de outro master.
- Verificacao esperada: o Validador mede intersecoes entre secoes e entre
  filhos de nivel superior da pagina com `validateCanvasOrganization`.

### Componentes e icones de biblioteca

- Origem: montagem da pagina Simulacao.
- Achado: uma tela pode precisar de um icone que ainda nao existe na
  biblioteca conectada.
- Regra a incorporar: o Montador procura primeiro no IDS. Sem equivalente,
  registra a lacuna e pede a criacao e publicacao no arquivo fonte, antes
  de considerar o icone um componente de biblioteca disponivel ao consumidor.
- Verificacao esperada: o Validador distingue instancia remota, vetor local
  aprovado e substituto local ainda pendente de biblioteca.

### Estruturas visualmente equivalentes

- Origem: montagem da pagina Simulacao.
- Achado: uma tela pode parecer correta e ainda usar componente destacado,
  componente local imitador, valor manual ou arvore inadequada.
- Regra a incorporar: o Montador deve construir os casos previstos no
  contrato e o Validador deve verificar estrutura, IDS e geometria sem exigir
  que a arvore copie uma referencia mal organizada.
- Verificacao esperada: o relatorio separa aderencia visual, estrutura,
  componentes remotos e valores vinculados.

## Casos disponiveis na pagina Simulacao

Os casos abaixo servem para exercitar leitura e validacao estrutural. A
pagina nao os rotula visualmente: a descoberta faz parte da analise.

- `ref-simulacao-04`: totalizador destacado de uma instancia de
  biblioteca.
- `ref-simulacao-07`: totalizador instanciado de componente local.
- `ref-simulacao-08`: `conteudo-rolavel` sem Auto Layout, mas com
  geometria manual equivalente.
