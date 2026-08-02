---
name: consignado-validacao
description: >-
  Validação de integridade de telas e templates do consignado após
  construção ou edição. Use quando o usuário pedir para validar telas,
  checar layout quebrado, verificar bindings de variáveis, conferir
  aderência ao IDS, ou como etapa final obrigatória após qualquer
  construção de tela. Gatilhos: validar, verificar quebra, checar
  layout, auditoria pós-construção, QA de tela.
user-invocable: true
disable-model-invocation: true
---

# Validação — Consignado

Siga o [Contrato de papeis](../../../docs/contrato-papeis.md). Esta
skill prova e relata. Ela nao corrige, monta, reclassifica regra ou
promove um rascunho.

Em chat novo, localize catalogo, mapa, manuais, contrato tecnico e
rascunho antes de abrir a validacao. Resumo de conversa anterior nao e
evidencia. Pergunte somente pelo elemento que nao puder localizar ou
pela confirmacao que bloquear o veredito.

## Como abrir a conversa

Antes de validar, situe qual entrega sera conferida, diga o que voce
consegue verificar sozinho e peca somente a proxima referencia, rascunho
ou regra que realmente estiver ausente. Explique que vai conferir se a
entrega reproduz o que foi aprovado e que, ao final, o designer recebera
um veredito claro. Nao comece por scripts, IDs, nomes de propriedade ou
uma lista de tudo que poderia ser necessario.

## Recursos obrigatorios

Leia antes de qualquer chamada Figma:

- [Plugin API do Figma](../figma-plugin-api/SKILL.md)
- [Reconstrucao Figma](../figma-reconstrucao/SKILL.md)
- [Validacao estrutural](../../../scripts/validateCreation.js)
- [Validacao de layout](../../../scripts/validateLayout.js)
- [Validacao do contrato de conteudo](../../../scripts/validateContentContract.js)
- [Validacao de comportamento por mode](../../../scripts/validateModeBehavior.js)
- [Validacao do contrato de reconstrucao](../../../scripts/validateReconstructionContract.js)
- [Validacao de interacao por contrato](../../../scripts/validateInteractionContract.js)
- [Validacao de organizacao do canvas](../../../scripts/validateCanvasOrganization.js)
- [Elegibilidade para promocao](../../../scripts/validatePromotion.js)
- [Taxonomia de nomes e carimbo](../../../docs/estrutura-lib.md)
- [Viewport-base](../../../docs/viewport-base.md)

Os links fazem parte da execucao. Citar o nome de uma skill ou script
na resposta nao prova que seu conteudo foi carregado.

## Como rodar os scripts deste repositório

`scripts/validateLayout.js` e `scripts/validateCreation.js` NÃO são
executáveis pelo Figma a partir do caminho. Não há `require`, `import`
nem acesso a disco dentro do sandbox da Plugin API. Para usar:

1. LEIA o arquivo do repositório, inteiro.
2. COLE o corpo da função dentro do script do `use_figma`.
3. Chame no fim: `return await validateLayout('<nodeId>')`.

Cole a versão atual do arquivo, sempre — nunca uma de memória. O
`validateLayout` tem 6 checagens (a 6ª é `emptyBoundText`) e o
`validateCreation` cobre estrutura mais convenções do projeto. Há dois
scripts complementares: `validateContentContract.js` confere o binding
de cada papel aprovado e `validateModeBehavior.js` prova os previews
por mode. Uma versão reescrita de cabeça perde checagem em silêncio e o
relatório sai dizendo "passou" com menos rigor do que aparenta.

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

Feche a parte de negocio dizendo, sem jargao, se a entrega esta apta
para promocao, reprovada ou ainda nao pode ser verificada, por que isso
aconteceu e o que acontecera depois. So entao apresente scripts, IDs e
evidencias tecnicas.

Você NÃO corrige nada: reporta. Se houver reprovação, pergunte quem
deve corrigir em vez de corrigir por conta.

## Modelo normativo
Siga docs/modelo-clusters.md (clusters como modes).

## Ordem de validação (após QUALQUER construção de tela)

### 0. Contrato de reconstrucao aprovado

Antes de medir o rascunho, confira que o catalogo da etapa contem o
contrato tecnico aprovado para aquele template: arvore por papeis, mapa
IDS, geometria comparavel, conteudo e excecoes. Rode
`validateReconstructionContract` com o rascunho e cada referencia por
cluster. Ela devolve tres blocos: `treeIssues`, `geometryIssues` e
`idsIssues`.

O script valida a arvore nova contra o contrato aprovado, nunca contra a
hierarquia acidental da referencia. Geometria e comparada de forma
relativa ao frame raiz, com tolerancia de 2 px salvo decisao diferente
no contrato. Instancia remota e opaca: valide sua key e properties
publicas, nao seus filhos. Qualquer bloco dos tres reprovado bloqueia
promocao.

### 1. Validação estrutural
Use scripts/validateCreation.js: nós existem, tipo certo, contagem de
filhos esperada.

### 2. Validacao matematica e visual de layout
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
entregue. Alem da prova matematica, obtenha screenshot da referencia,
do rascunho e do preview de cada cluster. Compare visualmente geometria,
hierarquia e blocos essenciais. Screenshot nao e decoracao nem pode
ser substituido por uma afirmacao de que a tela parece correta. Se
falhar, reporte e nao prossiga para promocao.

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
  dos dois lugares — cruze com a proposta aprovada do Analista
- rode `validateCreation` informando `contentCollectionId` da collection
  de conteudo. `missingContentBindings` reprova: token visual do IDS nao
  substitui binding de conteudo.
- `pinnedContentModes` reprova: master de template e seus descendentes
  nao podem ter mode explicito da collection de conteudo. O mode fica
  somente no wrapper de preview ou no frame de Fluxos.
- rode `validateContentContract` com o contrato aprovado da etapa. Cada
  papel precisa apontar para a variavel certa, e a saida deve nomear o
  papel que falhou. Se nao houver contrato aprovado, a cobertura de
  conteudo fica **NAO VERIFICAVEL**; nao invente papeis a partir da
  referencia. `type: text` exige variavel `STRING`; `type: visible`
  exige `BOOLEAN`.

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

**Preview so e prova valida se estiver em `_verificacao-<etapa>` e nao
tiver override em relacao ao master.** Preview na pagina da etapa ou em
`Fluxos`, ou preview que tenha reaction de prototipo, reprova a rodada
por misturar construcao, apresentacao e validacao. Use
`validateModeBehavior` para cada preview do mapa: ele
confere o mode explícito somente no wrapper, proíbe mode em qualquer
descendente, exige a instância do template selecionado sem override
manual, exige todos e somente os papéis aprovados, compara-os à
referência e roda `validateLayout` dentro daquele wrapper. Frames de
preview pinados por mode são o veículo prático para testar cluster a
cluster, mas um override manual num preview quebra a prova: você mede
uma coisa que o template não entrega.

Excecao estrita: a API pode registrar somente `name` como override
direto da propria instância de preview quando ela foi renomeada pelo
papel que exerce. Isso e permitido pela regra 34 de
`figma-plugin-api`, e `validateModeBehavior` registra em
`ignoredOverrides`. A excecao nao vale para outro campo, para um
registro com `name` mais outro campo, nem para `name` em no ou instância
filha: todos esses casos reprovam.

### 4. Screenshot (obrigatorio)
Obtenha screenshot por secao, sem reduzir a tela inteira, e compare
referencia, rascunho e cada preview. Use para localizar imagem esticada,
ilustracao errada, contraste ou bloco visual ausente, que a matematica
nao cobre. Screenshot nao e o unico criterio: o contrato deterministico
continua sendo a base do veredito. Se a captura for bloqueada, registre
`NAO VERIFICAVEL`; validacoes 1-3 nao liberam `tpl-*` sozinhas.

### 4b. Interacoes declaradas no contrato

Quando o contrato tecnico da tela declarar comportamento de interacao,
rode `validateInteractionContract`. Para cada acao declarada, ele
confere a existencia da reacao e, quando exigido, um destino ou retorno
de navegacao. Quando o contrato nomear um destino, ele tambem confere
que a acao chega naquela tela especifica, e nao apenas em algum lugar.
Quando o contrato declarar movimento, ele confere tambem o tipo de
gatilho, o atraso, a transicao, a duracao e os quatro pontos do Bezier.
Esses valores so podem vir da referencia ou de uma informacao explicita
do designer registrada na proposta aprovada.
Papeis de layout, como rodape fixo ou totalizador, nao
entram nesse script: sao validados por arvore, ordem e geometria no
`validateReconstructionContract`, somente se o contrato os declarar.
Quando o contrato declarar comportamento de rolagem, o mesmo script
confere `overflowDirection`, quantidade e ordem dos filhos fixos da
raiz. Sem essa declaracao, nao presume que uma tela deva ter rodape
fixo.
Para superficie mobile, ele tambem confere o viewport-base `360 x 800`,
salvo excecao explicita no contrato tecnico.
Para uma pagina que declarar suas regioes, rode tambem
`validateCanvasOrganization`: ele confere sobreposicao entre secoes e,
quando solicitado, entre masters locais.

### 5. Consistência mapa de fluxo <-> arquivo
- Todo template-base ou especializado selecionado em docs/mapa-fluxo-*.md existe no arquivo da lib
- Nenhum template no arquivo esta fora do mapa (orfao)
- Todo template especializado esta registrado em
  `docs/etapas/<etapa>.md`, tem nome funcional e nao contem o nome de
  um cluster. Especializacao ausente no catalogo e REPROVACAO.
- O GRAFO do mapa ainda bate com o prototipo. Extraia o grafo do
  prototipo do cluster do mesmo jeito que o Analista faz (Modo
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

### 8. Rascunho, promocao e legitimidade do prefixo tpl-
- Durante a validacao independente, o objeto correto e
  `_rascunho-<etapa>-<nome>`: COMPONENT ou COMPONENT_SET fora da pagina
  de referencias. Ele ainda nao pode se chamar `tpl-*`.
- `ref-*` e somente referencia crua. Reprove `ref-*` que seja
  COMPONENT ou COMPONENT_SET, pois mistura a fonte humana com o
  resultado da montagem.
- PREFIXO CONQUISTADO: varra o arquivo por qualquer no com `tpl-` no
  nome e reprove todo que NAO for COMPONENT/COMPONENT_SET. Frame com
  `tpl-` promete template publicavel e entrega rascunho; o nome certo
  nesse caso e `_rascunho-<etapa>-<nome>`. Este check existe porque o caso
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

### 8c. Veredito para promocao
O Validador nao renomeia nem corrige. Para cada `_rascunho-*`, devolva
apenas um destes vereditos:

- `APTO PARA PROMOCAO`: estrutura, contrato, modes, layout, revisao
  visual, mapa e manuais passaram; entregue tambem as evidencias para
  `validatePromotion`.
- `REPROVADO`: liste achados e mantenha o objeto como rascunho.
- `NAO VERIFICAVEL`: falta manual, mapa, referencia, screenshot ou
  outra evidencia; isso nao autoriza promocao.

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
Para cada tela, primeiro confirme que master e descendentes nao tem
mode explicito da collection de conteudo. Durante esta validacao,
alterna o mode apenas no wrapper de preview em `_verificacao-<etapa>`
(`setExplicitVariableModeForCollection`, com fontes carregadas antes),
compare o conteudo com a referencia e rode validateLayout de novo EM
CADA MODO. Texto que cabe em MG pode estourar em outro cluster.

### Interface minima entre Montador e Validador

O Montador entrega dois objetos, derivados do contrato aprovado da
etapa, sem IDs permanentes no repositorio:

```js
const contentContract = {
  collectionId: '<id da collection no arquivo atual>',
  roles: [
    {
      id: '<papel aprovado>',
      variable: '<grupo/nome-kebab>',
      type: '<text|visible>',
      binding: {
        kind: '<component-property|node>',
        target: { scope: '<template|node>', nodeName: '<obrigatorio no escopo node>' },
        property: '<quando component-property>',
        field: '<characters|visible, quando node>',
      },
    },
  ],
}
```

O Validador chama `validateContentContract(templateId, contentContract)`.
Depois recebe uma entrada para cada cluster selecionado no mapa e chama
`validateModeBehavior(previews, {
contentCollectionId,
expectedRoles: contentContract.roles.map(({ id, type }) => ({ id, type })),
validateLayout,
})`. Cada preview declara wrapper, mode, instancia, template,
referencia, raiz de layout dentro do wrapper e os mesmos papeis, com
`type` e seletor de no no preview e na referencia. Node IDs servem
apenas a execucao atual; a etapa documenta nomes e papeis, nao IDs do
Figma.

Some a essa interface a lista de screenshots revisados e o resultado
de `validateCreation` e `validateLayout` por preview. O Montador usa o
veredito e esses resultados como entrada de `validatePromotion`; sem
eles, nao ha promocao.
