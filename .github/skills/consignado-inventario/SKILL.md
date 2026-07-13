---
name: consignado-inventario
description: >-
  Auditoria somente leitura de arquivos Figma do crédito consignado para
  gerar matriz de variação entre clusters (órgãos públicos). Use quando o
  usuário pedir para inventariar, mapear, comparar ou auditar telas de
  clusters do consignado, ou preparar a criação da biblioteca central de
  templates. Gatilhos: inventário, matriz de variação, comparar clusters,
  auditar telas, mapear divergências.
---

# Inventário de Telas — Consignado

Três modos. MODO FLUXOS (primário quando as referências estão
linkadas por protótipo): extrair o grafo de navegação de cada página
de cluster e comparar estrutura + conteúdo. MODO REFERÊNCIAS
(telas soltas, sem protótipo): comparar telas de referência
construídas pelo designer (uma versão por cluster, cruas, lado a lado)
e derivar matriz + proposta de variáveis; a fonte é limpa, então pule
alertas de arqueologia e foque nos Passos 2, 4 e 5, comparando as
versões da MESMA tela entre clusters. MODO ARQUEOLOGIA (secundário):
extração de arquivos legados, todos os passos, espere ruído.

Auditoria SOMENTE LEITURA. Nunca crie, edite ou delete nós. Scripts via
use_figma devem ser exclusivamente de leitura (nenhum .create*, .remove,
atribuição de propriedade ou appendChild). Carregue também a skill
figma-plugin-api antes de qualquer use_figma.

## Modelo normativo
Siga docs/modelo-clusters.md (clusters como modes).

## Contexto de negócio
- Produto: crédito consignado para órgãos públicos (Itaú)
- Clusters: variações por órgão (ex: Governo de MG, Servidores Federais)
- Modalidades: primeira concessão e refinanciamento são fluxos com
  ESTRUTURAS distintas; nunca trate modalidade como variável
- As telas instanciam o IDS (Itaú Design System): componentes, tokens,
  ícones e ilustrações vêm de 4 bibliotecas externas distintas

## Contexto de etapa
O designer declara a etapa macro das telas em analise (consentimento,
simular-e-contratar, revisar, formalizar; ver docs/estrutura-lib.md).
Se não declarar, PERGUNTE antes de começar. A etapa marca todas as
linhas da matriz e do mapa e define o prefixo dos componentes na
proposta de componentização. Ofereça normalização assistida: conferir
nomes de camada das telas cruas contra o padrão e propor renomeações
(nunca renomear sem aprovação).

## Modo fluxos (grafo de navegação)

Pré-condição: o designer construiu as telas cruas de cada cluster numa
página própria (uma página por cluster) e as conectou por protótipo,
com flow starting points nomeados por caso de uso (ex: "Caso feliz").

1. Por página, extrair o grafo: telas de topo são nós; cada reaction
   ON_CLICK com navigation NAVIGATE é uma aresta (de, via, para).
   Reactions normalmente vivem em INSTÂNCIAS (botões do IDS): o rótulo
   do gatilho é o texto interno da instância, não o nome do nó.
   Percorrer com findAll(n => n.reactions.length > 0) e resolver o
   destinationId para a tela de topo que o contém.
2. Derivar o caminho principal por topologia, a partir do
   flowStartingPoint. NÃO usar rótulo de botão como critério. Três
   classificações:
   - ETAPA: destino que segue adiante no fluxo
   - DESDOBRAMENTO (tela de apoio): destino cujas saídas só retornam
     à origem (ida e volta), incluindo estados de espera (ex:
     aguardando anuência)
   - RAMO DE EXCEÇÃO: bifurcação real (2+ avanços possíveis); eleger
     como principal o ramo de maior alcance de telas novas e registrar
     os demais como exceção, com o gatilho de cada um
3. Cada flowStartingPoint nomeado é um caso de uso distinto; comparar
   caso a caso entre clusters.
4. Comparar entre clusters: (a) sequência do caminho principal;
   (b) conjunto de desdobramentos e de qual tela pendem; (c) conteúdo
   de cada tela pareada (textos visíveis, excluindo elementos de
   navegação). Divergência de sequência ou de presença de etapa
   alimenta o MAPA DE FLUXO; divergência de conteúdo alimenta a
   PROPOSTA DE VARIÁVEIS.
5. Saída extra deste modo: o rascunho do mapa de fluxo é GERADO do
   grafo (etapa, nível, presença por cluster, gatilho = rótulo do
   elemento com a reaction), não transcrito à mão. O protótipo é a
   fonte; o mapa é a documentação derivada e versionada.

## Sequência

### Passo 0 — Bibliotecas
`get_libraries` no arquivo. Registre as library keys das libs do IDS.
Elas são o filtro de todas as buscas seguintes.

### Passo 1 — Mapa estrutural
`get_metadata` na página do fluxo (uma chamada por página, nunca por nó).
Liste frames de tela de topo: node ID, nome, ordem no fluxo, nível
(1º nível, 2º nível). Se os clusters estão em páginas diferentes, emita
as chamadas em paralelo numa única mensagem.

### Passo 2 — Extração de fatos por tela
`use_figma` com script de leitura (lotes de 3-5 telas). Extrair JSON:
- instâncias: nome, node ID, mainComponent.key, remote true/false,
  detached (FRAME com nome de componente sem mainComponent)
- component properties expostas e seus valores atuais
  (componentProperties da instância)
- textos: node ID, characters, boundVariables (bindado ou não),
  textAutoResize
- hardcoded: fills/strokes com hex direto sem variável/style,
  espaçamentos e cornerRadius numéricos sem token

### Passo 3 — Resolução contra o IDS
`search_design_system` com includeLibraryKeys restrito às keys do
Passo 0. Component key que não resolve = [LOCAL], candidato a problema.

### Passo 4 — Pareamento entre clusters
Pareie telas equivalentes por posição no fluxo + composição + nome.
Classifique: IDENTICA | VARIA_TEXTO | VARIA_VISIBILIDADE |
VARIA_COMPONENTE | VARIA_PROPRIEDADE (mesma instância, properties com
valores diferentes) | VARIA_ESTRUTURA | SEM_PAR.
VARIA_TEXTO: liste os pares de strings lado a lado.
VARIA_VISIBILIDADE: blocos presentes num cluster e ausentes no outro,
com node IDs.
Use get_screenshot apenas para desempatar pareamento ambíguo (máx 1
por dúvida). Se captura de imagem estiver bloqueada no ambiente,
resolva por composição estrutural e marque [PAREAMENTO INCERTO].

### Passo 5 — Candidatos a variável
- string: textos divergentes entre clusters → `grupo/nome-kebab`
- boolean: blocos com presença condicionada a cluster
- number: valores, limites, prazos divergentes
Textos idênticos entre clusters NÃO viram variável.
Properties de componente que divergem por cluster viram nota de
instanciação, não variável (o construtor aplicará via setProperties).

### Passo 6 — Alertas
Detached, [LOCAL], hardcoded, textAutoResize NONE/TRUNCATION em textos
que receberão variável, divergências que parecem acidente
→ [VERIFICAR COM DESIGNER].

### Passo 7 — Mapa de fluxo
Derive do pareamento o rascunho do mapa de fluxo por cluster
(docs/mapa-fluxo-<escopo>.md): etapa | nivel (1 obrigatoria, 2 opcional)
| presenca por cluster | gatilho | template. Telas SEM_PAR indicam
presenca divergente. Marque incertezas como [VERIFICAR COM DESIGNER].
Se o mapa ja existe, gere um diff proposto, nunca sobrescreva sem
revisao. O mapa e a FONTE UNICA de composicao de fluxo; nunca proponha
booleans de variavel para presenca de etapa.

## Regras aprendidas em laboratorio (obrigatorias)
- Nomes de frame NUNCA com barra (/): quebra pareamento por caminho.
  Convencao: hifen (ref-simulacao-c1-mg).
- Pareamento por caminho deve normalizar removendo o prefixo da raiz
  por substring, nao por split de segmentos.
- Camadas de TEXT renomeiam sozinhas para o conteudo: nunca localizar
  texto por nome de camada; localizar por conteudo atual ou node ID.

## Divergencias sem regra conhecida
Toda divergencia encontrada entre clusters deve ter contrapartida em
docs/clusters/<cluster>.md. Se nao tiver, NAO invente a razao: liste em
"Divergencias sem regra documentada" e proponha o texto da regra para o
designer confirmar. Regra confirmada vira entrada no manual do
convenio. E assim que o conhecimento sai das cabecas e entra no repo.

## Saída
`inventario/<escopo>.md` com as 6 seções, tudo referenciado por node ID,
tabelas markdown, sem prosa desnecessária.
