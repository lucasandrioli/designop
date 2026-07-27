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

## Como rodar os scripts deste repositório

`scripts/validateLayout.js` e `scripts/validateCreation.js` NÃO são
executáveis pelo Figma a partir do caminho. Não há `require`, `import`
nem acesso a disco dentro do sandbox da Plugin API. Para usar:

1. LEIA o arquivo do repositório, inteiro.
2. COLE o corpo da função dentro do script do `use_figma`.
3. Chame no fim: `return await validateLayout('<nodeId>')`.

Cole a versão atual do arquivo, sempre — nunca uma de memória. O
`validateLayout` tem 6 checagens (a 6ª é `emptyBoundText`) e o
`validateCreation` cobre estrutura mais 4 convenções do projeto; uma
versão reescrita de cabeça perde checagem em silêncio e o relatório sai
dizendo "passou" com menos rigor do que aparenta.

## Descoberta do escopo

Não espere node IDs prontos. A partir do que a tarefa informar (arquivo,
página, etapa), descubra sozinho o que precisa validar.

CUIDADO: `get_metadata` sem `nodeId` pode devolver apenas UMA página do
arquivo, não todas. Confiar nisso leva a concluir que um template não
existe e reprovar por ausência algo que está lá. Enumere as páginas por
script (`figma.root.children`) antes de decidir que algo não existe. Aplique os itens da ordem abaixo que fizerem sentido para o
escopo pedido e PULE explicitamente os que não se aplicam, dizendo
quais pulou e por quê (ex: itens de mapa de fluxo e protótipo quando
ainda não existe mapa). Item pulado em silêncio vira falsa cobertura.

## Formato do relatório

Duas partes, nesta ordem. Primeiro um resumo em português simples:
passou ou reprovou, quantos achados, e cada reprovação em UMA linha de
negócio — "o texto de portabilidade não muda entre convênios mas
deveria", nunca "elegibilidade/mostra-portabilidade ausente em 73:98".
Depois o relatório técnico completo por tela/objeto, com `passed`
true/false, node IDs e severidade (reprova vs aviso), como apoio.

Você NÃO corrige nada: reporta. Se houver reprovação, pergunte quem
deve corrigir em vez de corrigir por conta.

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

**Procure o binding nos DOIS lugares, sempre, e nesta ordem.** Um
template bem construído segue PROPERTY FIRST (docs/modelo-clusters.md):
o binding vive em `instance.componentProperties[key].boundVariables`, e
o nó de TEXT lá dentro fica com `boundVariables` VAZIO. Olhar só o nó
de texto reprova o template correto e aprova o errado — é falso
positivo garantido em trabalho bem feito.

    1. instance.componentProperties[<key>].boundVariables  <- o normal
    2. node.boundVariables no nó interno                   <- fallback

Um binding achado só em (2), num conteúdo que poderia estar exposto
como property, é AVISO de fragilidade, não aprovação: nó interno de
instância remota invisible fica inacessível (regra 25 de
figma-plugin-api).

Verifique também:
- nenhuma instância detached
- todo componente resolve para as library keys do IDS (por
  `mainComponent.key`, nunca por `instance.name` — instância pode estar
  renomeada pelo papel, regra 34)
- textos bindados têm textAutoResize compatível (HEIGHT ou
  WIDTH_AND_HEIGHT; nunca NONE/TRUNCATION)
- todo conteúdo que DEVERIA variar por cluster está bindado em algum
  dos dois lugares — cruze com a matriz do comparador, se houver

### 3b. Equivalência contra as referências cruas

Os scripts podem dar `passed: true` num template que contradiz a tela
que o designer desenhou: eles medem geometria e estrutura, não
intenção. Esta checagem é o que pega isso, e é obrigatória sempre que
existirem referências cruas da etapa.

Para cada cluster e caso de uso selecionado no mapa: extraia os textos
visiveis em ordem de documento do template indicado (`padrao` ou
especializacao) no mode daquele cluster, e da referencia crua daquela
secao `_ref-<cluster>`. Devem bater, sem faltas nem sobras. Divergencia
e REPROVA, e o achado se descreve pelos dois lados.

Compare também a VISIBILIDADE de blocos, não só texto: bloco escondido
num mode cujo conteúdo aparece na referência é o caso mais comum, e é
invisível para qualquer checagem de layout.

**Preview só é prova válida se não tiver override em relação ao
master.** Frames de preview pinados por mode são o veículo prático para
testar cluster a cluster, mas um override manual num preview quebra a
prova: você mede uma coisa que o template não entrega. Antes de usar um
preview como evidência, confira `overrides` / properties da instância
contra o master e reporte qualquer divergência como achado próprio.

### 4. Screenshot (fallback, se o ambiente permitir)
get_screenshot por SEÇÃO (não da tela inteira em resolução reduzida),
procurando texto cortado e sobreposições. Use quando: validateLayout
passou mas o resultado envolve conteúdo visual que a matemática não
cobre (imagem esticada, ilustração errada, contraste). Se captura for
bloqueada no ambiente, registre [VALIDAÇÃO VISUAL PENDENTE] e siga
com as validações 1-3 como critério de aceite.

### 5. Consistência mapa de fluxo <-> arquivo
- Todo template-base ou especializado selecionado em docs/mapa-fluxo-*.md existe no arquivo da lib
- Nenhum template no arquivo esta fora do mapa (orfao)
- Todo template especializado esta registrado em
  `docs/etapas/<etapa>.md`, tem nome funcional e nao contem o nome de
  um cluster. Especializacao ausente no catalogo e REPROVACAO.
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

### 8b. Varredura de publicacao (quando a pergunta e "esta pronto para publicar?")
O escopo aqui e o ARQUIVO, nao o template. Publicar e uma acao de
arquivo inteiro: tudo que for COMPONENT sem prefixo `_` entra na
biblioteca junto, esteja ou nao no escopo da tarefa.

Varra todos os COMPONENT e COMPONENT_SET do arquivo e reporte os que
nao pertencem a taxonomia de docs/estrutura-lib.md: nome sem prefixo de
etapa, sem descricao, resto de rascunho, componente solto largado numa
pagina de referencias. Cada um e uma reprova, porque entra na lib no
proximo publish e vira divida permanente para quem consome.

Se a pergunta foi so "o template X esta certo?", isto e aviso, nao
reprova — mas reporte mesmo assim.

### 9. Conformidade com o manual do convenio
Para cada cluster, leia docs/clusters/<cluster>.md, a secao
`Implementacao aprovada`, o catalogo da etapa e o mapa. Verifique cada
regra ATIVA contra o mecanismo registrado depois da aprovacao:
- regra com mecanismo "mapa de fluxo" -> a etapa existe/nao existe
  conforme declarado
- regra com mecanismo "variavel X" -> a variavel existe e esta bindada
- regra com mecanismo "variant Z" -> o variant existe no template
  selecionado no mapa
- regra com mecanismo "especializacao S" -> S existe no catalogo da
  etapa e o mapa seleciona o template correspondente para esse cluster
Reprovacao cita a regra (ex: "R3 do c4 exige anuencia; o mapa nao tem
a etapa"). Isto transforma validacao de "esta bonito?" em "esta
conforme?", que e a linguagem de auditoria.

## Teste de troca de modo (obrigatório para templates com variáveis)
Para cada tela: alterne a variável de modo do cluster
(setExplicitVariableModeForCollection, com fontes carregadas antes) e
rode validateLayout de novo EM CADA MODO. Texto que cabe em MG pode
estourar em outro cluster.
