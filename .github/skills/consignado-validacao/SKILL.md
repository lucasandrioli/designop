---
name: consignado-validacao
description: >-
  Validação de integridade de telas e templates do consignado após
  construção ou edição. Use quando o usuário pedir para validar telas,
  checar layout quebrado, verificar bindings de variáveis, conferir
  aderência ao IDS, ou como etapa final obrigatória após qualquer
  construção de tela. Gatilhos: validar, verificar quebra, checar
  layout, auditoria pós-construção, QA de tela.
---

# Validação — Consignado

Carregue a skill figma-plugin-api antes de qualquer use_figma.

## Modelo normativo
Siga docs/modelo-clusters.md (clusters como modes).

## Ordem de validação (após QUALQUER construção de tela)

### 1. Validação estrutural
Use scripts/validateCreation.js: nós existem, tipo certo, contagem de
filhos esperada.

### 2. Validação matemática de layout (primária, não depende de imagem)
Use scripts/validateLayout.js no frame raiz de cada tela construída.
Reprovam a tela: clippedText, overlaps, missingFonts.
Metrica de corte: absoluteBoundingBox do texto contra ancestrais com
clipsContent (render bounds e pos-clipping e nao detecta corte).
Texto bindado com textAutoResize NONE/TRUNCATION e reprovado por
principio: o corte fica geometricamente indetectavel.
Avisos que exigem justificativa: noAutoLayout (frame com 2+ filhos sem
auto layout), absoluteChildren (layoutPositioning ABSOLUTE),
emptyBoundText (TEXT com variável bindada mas characters vazio — cruzar
com a seção 5: só é esperado se o mapa de fluxo confirma que a etapa
não existe naquele cluster; caso contrário, é achado a reportar).
Isencoes automaticas do validateLayout (nao sao erro): nos dentro de
INSTANCE (validam-se no master) e nos de arte vetorial (icones e
ilustras, cujos filhos sao apenas shapes; sobreposicao ali e
intencional). Clipping de texto e fonte faltando continuam checados
em qualquer nivel.
Regra: toda tela deve passar com passed=true antes de ser considerada
entregue. Se falhar, corrija e revalide. Não prossiga para a próxima
tela com validação pendente.

### 3. Validação de bindings e IDS
Script de leitura verificando:
- todo TEXT que representa conteúdo variável por cluster tem
  boundVariables preenchido
- nenhuma instância detached
- todo componente resolve para as library keys do IDS
- textos bindados têm textAutoResize compatível (HEIGHT ou
  WIDTH_AND_HEIGHT; nunca NONE/TRUNCATION)

### 4. Screenshot (fallback, se o ambiente permitir)
get_screenshot por SEÇÃO (não da tela inteira em resolução reduzida),
procurando texto cortado e sobreposições. Use quando: validateLayout
passou mas o resultado envolve conteúdo visual que a matemática não
cobre (imagem esticada, ilustração errada, contraste). Se captura for
bloqueada no ambiente, registre [VALIDAÇÃO VISUAL PENDENTE] e siga
com as validações 1-3 como critério de aceite.

### 5. Consistência mapa de fluxo <-> arquivo
- Todo template listado em docs/mapa-fluxo-*.md existe no arquivo da lib
- Nenhum template no arquivo esta fora do mapa (orfao)
- O GRAFO do mapa ainda bate com o prototipo. Extraia o grafo do
  prototipo do cluster do mesmo jeito que o comparador faz (Modo
  Fluxos: reactions ON_CLICK/NAVIGATE, resolvendo destinationId para a
  tela de topo) e compare com o bloco mermaid daquele cluster no mapa.
  Reportar como achado, por cluster: aresta no prototipo e nao no mapa,
  aresta no mapa e nao no prototipo, e no com nivel/forma divergente
  (`[etapa]` virou `([desdobramento])` ou vice-versa).
  Isto e DERIVA, o achado mais comum depois que o fluxo muda e ninguem
  atualiza o doc. O prototipo e a fonte; o mapa e a documentacao. Se
  divergirem, reporte os dois lados e pergunte qual esta certo — nao
  assuma que o prototipo venceu, porque o mapa tambem carrega decisao
  de negocio que pode ainda nao ter sido construida.
- Toda variavel bindada em um template tem valor preenchido em todos os
  modes dos clusters onde a etapa existe (valor vazio so e aceitavel em
  cluster onde o mapa diz que a etapa nao existe, e nesse caso deve ser
  questionado se a variavel deveria existir)

### 6. Consistência grafo de protótipo <-> mapa
Nas páginas de fluxo: extrair o grafo (reactions) e conferir contra o
mapa versionado: mesma sequência de etapas por cluster, mesmos
desdobramentos, starting points com os nomes dos casos de uso.
Divergência = ou o protótipo está errado, ou o mapa está desatualizado;
reportar qual lado provavelmente mudou (pelo histórico do mapa).

### 7. Atualizacao de biblioteca (IDS) em dois momentos
PRE-SCAN (antes de aceitar o update no arquivo): varrer instancias por
mainComponent.key dos componentes alterados e listar telas/templates
afetados; e o apoio a decisao de aceitar. POS-SCAN (depois de aceitar):
conferir que todas as instancias mapeadas refletem a mudanca e rodar
validateLayout em cada tela afetada, em todos os modes. Lembrete:
updates de biblioteca exigem aceite manual no arquivo consumidor.

### 8. Descricao dos templates (carimbo) e legitimidade do prefixo tpl-
- PREFIXO CONQUISTADO: varra o arquivo por qualquer no com `tpl-` no
  nome e reprove todo que NAO for COMPONENT/COMPONENT_SET. Frame com
  `tpl-` promete template publicavel e entrega rascunho; o nome certo
  nesse caso e `ref-nome-cluster`. Este check existe porque o caso
  aconteceu de verdade: 9 frames com prefixo `tpl-` passaram
  despercebidos ate uma auditoria manual (docs/estrutura-lib.md, "O
  prefixo tpl- e CONQUISTADO").
- Todo componente publicado tem descricao no formato do carimbo
  (docs/estrutura-lib.md); ausencia reprova a publicacao.
- DERIVA: a lista [Variaveis] da descricao deve bater com os
  boundVariables reais extraidos por varredura. Divergencia significa
  que o template mudou e a descricao mentiu; regerar via Montador.
- [Etapa] deve bater com o prefixo do nome e com o mapa.
- [Modalidade] deve bater com o segmento do nome quando houver
  (`etapa/modalidade/tpl-nome`); ausencia do campo em template criado
  a partir de 2026-07-25 e deriva de formato, reporte como aviso.
- [Nivel] 2 exige [Gatilho] preenchido; nivel 2 sem gatilho declarado e
  reprovacao (quem consome nao sabe como chegar naquela tela).

### 9. Conformidade com o manual do convenio
Para cada cluster, leia docs/clusters/<cluster>.md e verifique cada
regra ATIVA contra o mecanismo declarado:
- regra com mecanismo "mapa de fluxo" -> a etapa existe/nao existe
  conforme declarado
- regra com mecanismo "variavel X" -> a variavel existe e esta bindada
- regra com mecanismo "variant Z" -> o variant existe no template
Reprovacao cita a regra (ex: "R3 do c4 exige anuencia; o mapa nao tem
a etapa"). Isto transforma validacao de "esta bonito?" em "esta
conforme?", que e a linguagem de auditoria.

## Teste de troca de modo (obrigatório para templates com variáveis)
Para cada tela: alterne a variável de modo do cluster
(setExplicitVariableModeForCollection, com fontes carregadas antes) e
rode validateLayout de novo EM CADA MODO. Texto que cabe em MG pode
estourar em outro cluster.
