---
name: consignado-comparador
description: >-
  Auditoria somente leitura de arquivos Figma do crédito consignado para
  gerar matriz de variação entre clusters (órgãos públicos). Use quando o
  usuário pedir para inventariar, mapear, comparar ou auditar telas de
  clusters do consignado, ou preparar a criação da biblioteca central de
  templates. Gatilhos: comparador, matriz de variação, comparar clusters,
  auditar telas, mapear divergências.
---

# Comparador de Telas — Consignado

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

## Checagem inicial (a PRIMEIRA coisa, antes até do intake)

Não comece a comparar num terreno que não existe. Verifique, na ordem,
e PARE se faltar — devolvendo a lista do que falta em linguagem de
negócio, não em nome de arquivo. Referência completa: `docs/instalacao.md`.

1. **Existe manual dos clusters envolvidos?** (`docs/clusters/<cluster>.md`)
   Se não existir, PARE. Sem ele você vai inventar a razão de cada
   divergência, que é exatamente o que este projeto proíbe. Diga ao
   designer: *"antes de comparar, preciso que exista um manual de cada
   convênio envolvido — pelo menos as regras que tocam esta etapa. Tem
   um modelo em docs/clusters/_template.md. Sem isso eu consigo achar
   as diferenças, mas não consigo dizer se cada uma é regra do convênio
   ou descuido de construção."*
2. **Existe doc da etapa?** (`docs/etapas/<etapa>.md`) Se não, avise que
   vai precisar ser criado e ofereça gerar o rascunho a partir do que
   você medir — mas isso NÃO bloqueia a comparação, só a construção
   depois.
3. **São 2+ clusters?** Com um cluster só não existe comparação, e sem
   comparação não há variação a descobrir. PARE e explique: *"com um
   convênio só eu não tenho contra o que comparar; a variação só
   aparece no confronto entre dois."*
4. **Há tela de referência para cada cluster declarado?** Se faltar de
   algum, PARE — você não constrói tela do zero (Bloco 3 do projeto,
   ainda não destravada).

O que NÃO é motivo para parar: tela bagunçada. Componente destacado,
camada sem nome, sem auto layout, cor fora do token — tudo isso é
esperado e é seu trabalho auditar e reportar (Modo Arqueologia). Fonte
suja é tolerada; fonte ausente não é.

## Perguntas antes de começar (depois dos pré-requisitos, antes de comparar)

Nunca assuma que o designer vai entregar telas já nomeadas ou
organizadas do jeito que a doutrina pede (`ref-nome-cluster`, página
por cluster, etc). Isso é NORMALIZAÇÃO — trabalho do agente, nunca
conhecimento que o designer precisa decorar antes de começar. O
designer só precisa fazer uma coisa: juntar as telas numa seção/página
e responder 4 perguntas simples. Se ele não respondeu ainda, PERGUNTE
antes de tocar em qualquer script:

1. **Onde estão as telas?** — peça a seção/página/frame onde ele
   juntou tudo (não precisa estar organizado, só junto).
2. **De qual etapa são?** — consentimento | simular-e-contratar |
   revisar | formalizar | outra (ver docs/estrutura-lib.md). Se a
   etapa não existir ainda em docs/etapas/, sinalize que vai precisar
   ser criada.
3. **De quais clusters, e qual tela é de qual?** — para cada tela ou
   grupo de telas, qual convênio ela representa. Não adivinhe pelo
   conteúdo sozinho; peça a declaração.
4. **É caminho feliz, ramo de exceção, ou desdobramento?** — isso muda
   a classificação no Passo 4 (ETAPA que segue adiante vs
   DESDOBRAMENTO ida-e-volta vs RAMO DE EXCEÇÃO). Pergunte
   explicitamente; nunca infira do rótulo do botão.

Só depois dessas respostas, examine as telas de verdade (`get_metadata`)
e proponha uma normalização concreta: nomes de frame sugeridos
(`ref-nome-cluster`, sem barra — nunca `etapa/tpl-nome`, essa
convenção é só para template já publicado), organização de página.
Apresente a proposta e espere aprovação antes de renomear qualquer
coisa — nunca renomeie sem aprovação, e nunca prossiga para o Passo 1
sem a etapa, os clusters e o tipo de caminho confirmados.

A etapa marca todas as linhas da matriz e do mapa e define o prefixo
dos componentes na proposta de componentização.

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

Extraia `componentProperties` de TODA instância de accordion/item
colapsável (ex: `item-colapsavel`), independente do variant `Estado`
estar aberto ou fechado. O valor de uma property (ex: `Conteudo#7:3`)
continua acessível na instância mesmo quando o variant ativo
(`Estado=fechado`) não tem o nó de texto correspondente renderizado —
a property vive na instância, não no variant visível. NUNCA reduza a
comparação ao que aparece expandido na tela/screenshot: leia todas as
instâncias por `componentProperties`, aberto ou fechado, sempre.
(Confirmado com dado real: laboratorio/fila-de-testes.md, Teste 12.)

### Passo 2b — Composição local e componente local do designer

O designer frequentemente compõe coisas no arquivo dele: pega um card,
junta um texto, define espaçamento na mão, e às vezes transforma isso
num COMPONENTE LOCAL do próprio arquivo (não vem do IDS). Isso não é
erro automático — é o que acontece quando falta peça no IDS. Trate
assim, sempre com evidência:

1. **Detecte** todo `COMPONENT`/`COMPONENT_SET` cujo `remote === false`
   (criado localmente) e toda composição de frames crus que carrega
   conteúdo de negócio.
2. **Audite aderência a token** em cada um (ver regras 19a e 19b de
   figma-plugin-api): para cada `itemSpacing`, padding, `cornerRadius` e
   fill, diga (a) o valor literal que está na tela, (b) se está bindado
   a token, (c) se existe token com aquele valor NO SCOPE CERTO, e (d) se
   não existir, qual é a escala válida e o token mais próximo. O valor
   manual é sempre legível pela API, mesmo sem token.
3. **Classifique o destino**, e note que você NÃO decide qual é — você
   apresenta a evidência e pergunta:
   - **DUPLICA algo que já existe no IDS** → substituir por instância.
     Evidência: componente do IDS com estrutura/geometria equivalente.
     É a hipótese mais comum e a mais barata de resolver.
   - **É NOVO e reutilizável** → candidato a virar componente no IDS
     (pedido ao dono do design system). Evidência: aparece em 2+ telas
     ou 2+ clusters, e nenhum componente do IDS cobre.
   - **É composição de uso único** → pode ficar local, mas tem que usar
     token. Evidência: aparece uma vez só, específico daquela tela.
4. **Nunca** recrie a composição como frame solto dentro de um template
   publicado da lib: isso propaga o problema em vez de resolver.

Componente local NÃO é o mesmo que `[LOCAL]` do Passo 3 (aquele é
component key que não resolve contra as libs do IDS). Um componente
local legítimo do designer resolve normalmente — ele só não é do IDS.

### Passo 3 — Resolução contra o IDS
`search_design_system` com includeLibraryKeys restrito às keys do
Passo 0. Component key que não resolve = [LOCAL], candidato a problema.
Resolva sempre por `mainComponent.key` (ou `getMainComponentAsync()`),
nunca pelo `instance.name` — uma instância pode estar renomeada por
PAPEL (ex: uma instância de `banner-desconto` chamada
`aviso-consentimento` na tela — convenção de nomeação por papel).
Nome de instância divergente do nome do componente NÃO é sinal de
`[LOCAL]` nem de duplicação; só a key decide (regra 34 de
figma-plugin-api/SKILL.md).

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
(docs/mapa-fluxo-<escopo>.md), em DUAS formas complementares. As duas
saem do mesmo grafo extraido no Modo Fluxos; nao escolha uma.

**7a. Tabela de presenca** — etapa | nivel (1 obrigatoria, 2 opcional)
| presenca por cluster | template. Uma coluna por cluster: e a forma
que se compara de relance. Telas SEM_PAR indicam presenca divergente.

**7b. Grafo por cluster** — um bloco ```mermaid por cluster e por caso
de uso (flowStartingPoint), com a notacao fixa do template
`docs/mapa-fluxo-_template.md`:
`[etapa]`, `([desdobramento])`, `{ramo de excecao}`, `-->` avanco,
`-.->` ida e volta, `|gatilho|` com o rotulo REAL do elemento que tem a
reaction, no apontando para si mesmo = espera passiva.

O grafo NAO e enfeite nem duplicata da tabela: e o que impede o
achatamento. Ordem, bifurcacao, aresta de retorno e de qual etapa um
desdobramento pendura sao informacao que a tabela nao tem onde guardar
— e que, sem o grafo, vaza como prosa numa celula ("apos a senha; o
retorno atualiza a efetivacao"). Voce ja extraiu o grafo do prototipo
no Modo Fluxos; emita-o, nao o achate.

REGRA: se voce estiver prestes a escrever uma frase explicativa dentro
de uma celula da tabela, pare — aquilo e uma aresta, e o lugar dela e
no mermaid.

Cuidado especifico, aprendido em laboratorio: quando a MESMA etapa tem
topologia diferente entre clusters (mais nos internos, saida ativa vs
espera passiva), isso e "mesma etapa com mais passos", NAO "duas etapas
diferentes". Emita os dois grafos e deixe a diferenca visivel; a
INTERPRETACAO do que ela significa e [VERIFICAR COM DESIGNER], nunca
sua conclusao. (Teste 11, laboratorio/fila-de-testes.md: essa conclusao
forte foi tirada sem confirmacao e estava errada.)

Marque incertezas como [VERIFICAR COM DESIGNER]. Se o mapa ja existe,
gere um diff proposto, nunca sobrescreva sem revisao. O mapa e a FONTE
UNICA de composicao de fluxo; nunca proponha booleans de variavel para
presenca de etapa.

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

Duas partes, nesta ordem. A primeira é o que o designer realmente lê;
a segunda é referência técnica (para o montador e para quem
quiser auditar).

### 1. Checklist para aprovação (sempre primeiro, sempre em linguagem de negócio)

**Formato: TABELA comparativa**, uma linha por candidato a
variável/divergência. Coluna por cluster (uma coluna por cluster
comparado, não uma só), lado a lado — é o que faz o formato ser
comparativo de verdade, não uma lista de perguntas soltas. Colunas
obrigatórias: `#`, `Achado` (nome curto), `Onde` (nome da tela +
link/node ID de cada versão — SEMPRE presente, é o que permite alguém
abrir a tela real e conferir; nunca só o texto sem apontar de onde ele
veio), uma coluna por cluster com o CONTEÚDO REAL daquela tela (citação
fiel ou resumo preciso — nunca invente o texto), `Pergunta` (a decisão
que precisa ser tomada, 1 frase, com "⚠ ..." embutido quando o achado
pode ser mais profundo que copy), `Proposto` (resposta curta).

**NUNCA faça uma linha sem o conteúdo real de cada cluster nas
colunas, e NUNCA sem a coluna `Onde` apontando a tela/link/node de
cada versão** — pergunta sem o texto/valor concreto ao lado é abstrata
demais pra decidir, e achado sem apontar de onde veio não dá pra
conferir. Já foi reportado como "mecânico, sem contexto, nada que
ajude a decidir", depois "não dá pra ser em formato de tabela/
comparativo?", depois "não tem referência de qual é a tela" — as três
coisas são regra agora, não sugestão.

Se as versões tiverem tamanhos diferentes (ex: uma lista com mais
itens que a outra), a célula de cada cluster lista TODOS os itens
daquela versão, não só a diferença — o designer precisa ver o conjunto
pra julgar se faz sentido, não só o delta.

Não pergunte sobre algo já decidido/declarado antes da comparação (ex:
conteúdo marcado [EXEMPLO] pelo próprio construtor não precisa de
pergunta "isso é exemplo?" — já se sabe que é; pule direto pro que é de
fato incerto).

Feche sempre com: "Responda com o número + sim/não. Se não, me diga o
motivo — isso vira regra registrada no manual do convênio."

Exemplo real, formato corrigido (etapa Revisar, c1-mg × c4-federais):

    | # | Achado | Onde | MG | Federal | Pergunta | Proposto |
    |---|---|---|---|---|---|---|
    | 1 | Linha extra de encargo | tela "Encargos e taxas" — [MG](figma.com/...?node-id=89-248) / [Federal](figma.com/...?node-id=90-268) | IOF R$ 210,40, Tarifa abertura R$ 0,00, CET 1,89% a.m. (3 linhas) | IOF R$ 280,00, Tarifa abertura R$ 0,00, Tarifa de averbação no órgão R$ 35,00, CET 1,75% a.m. (4 linhas) | Essa linha a mais é cobrança real só do federal, ou exemplo a mais por engano? | Se real: lista com liga/desliga por linha, por convênio |
    | 2 | Mecanismo do desconto em folha | tela "Garantia e consignação" — [MG](figma.com/...?node-id=89-284) / [Federal](figma.com/...?node-id=90-307) | "descontada direto na folha, autorização no próprio contrato" | "descontada em folha e repassada pelo órgão pagador federal, autorização formal no processo de contratação" | ⚠ É etapa a mais de verdade (repasse, autorização formal separada) ou só forma mais formal de escrever? Pode ser regra jurídica, não só copy | [VERIFICAR COM DESIGNER] |

    Responda com o número + sim/não. Se não, me diga o motivo — isso
    vira regra registrada no manual do convênio.

### 2. Detalhe técnico (`comparador/<escopo>.md`)

Depois do checklist, ou em arquivo separado linkado: as 6 seções
completas, tudo referenciado por node ID, tabelas markdown, sem prosa
desnecessária. Esta parte existe para o montador consumir e para
auditoria — não é o que se espera que o designer leia linha a linha.
