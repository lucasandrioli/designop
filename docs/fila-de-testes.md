# Fila de testes de robustez

| # | Teste | O que prova | Status |
| --- | --- | --- | --- |
| 1 | Caminho com desvio de erro (anuencia pendente, so no c2) | Deteccao de etapa extra no caminho + estado de espera classificado como tela de apoio; zero falso positivo | PASSOU (lab) |
| 2 | Tela com estados x convenio (efetivacao aguardando/concluida) | Estado do usuario (variants) cruzado com conteudo do convenio (modes) na mesma tela | pendente |
| 3 | Texto que estoura em um convenio | O Revisor pega quebra de layout ao trocar de convenio, sem olho humano | PASSOU (apos correcao de metrica) |
| 4 | Lista com N itens diferentes por convenio + forma diferente (lista vs stepper) | Slots+booleans para quantidade; secao polimorfica para natureza; validado com componentes remotos do Mini DS | PASSOU |
| 5 | Atualizacao do design system (IDS) | Varredura de impacto na lib apos publish de mudanca | PASSOU (15/15 instancias propagadas, 8 telas validadas em 2 modes, zero quebra) |
| 6 | Dessincronizacao prototipo x mapa | O Revisor denuncia quando alguem muda o prototipo e esquece o mapa | PASSOU (dessincronizacao real do teste 1 detectada; mapa corrigido) |

Aprendizado do teste 1: a topologia distingue sozinha "etapa da
jornada" (segue adiante) de "estado de espera" (ida e volta) e de
"caminho de excecao" (bifurcacao que segue adiante por outra rota).
As tres classificacoes existem no comparador v2.

Aprendizado do teste 3 (o mais importante da bateria): a metrica de
corte contra ancestrais e absoluteBoundingBox (caixa de layout), NUNCA
absoluteRenderBounds (pixels pos-clipping, que por definicao nao
excedem quem clipa). O teste foi desenhado para falhar e falhou
silenciosamente ate a metrica ser corrigida; e o argumento definitivo
de por que testes com defeito plantado precisam existir antes de
confiar no Revisor em producao.

Regra de fidelidade (apontada pelo designer): TODO teste de lab usa
componentes remotos do Mini DS, nunca frames/textos crus, porque o
cenario real e sempre componente remoto do IDS e ha comportamentos
(overrides em instancia, propagacao) que so aparecem no mecanismo
verdadeiro. Os testes 1, 3 e 6 usaram telas cruas por foco em
topologia; a partir do teste 4 a regra e obrigatoria.

Aprendizados do teste 5:
- Atualizacao de biblioteca NAO se propaga sozinha: o arquivo
  consumidor precisa aceitar ("Updates available"). No processo real,
  a varredura do Revisor tem DOIS momentos: pre-scan antes de aceitar
  (o que VAI ser afetado, apoio a decisao de aceitar) e pos-scan
  depois (propagacao conferida + validateLayout em todas as telas
  afetadas, em todos os modes).
- O pre-scan por mainComponent.key e a resposta operacional a "o IDS
  mudou, o que isso afeta na minha lib?", pergunta que hoje ninguem
  responde sem abrir arquivo por arquivo.

BATERIA COMPLETA: 6/6 testes aprovados. O ciclo operacional da lib
(comparar, variabilizar, componentizar, validar, manter) esta provado
em laboratorio contra casos de erro, estados, quebras, listas
variaveis, dessincronizacao e atualizacao do design system.

## Revalidacao com fidelidade total (fluxos v2)

A pedido do designer, os testes 1, 3 e 6 foram REFEITOS com componentes
remotos do Mini DS (paginas Fluxo-c1-v2 e Fluxo-c2-v2), substituindo as
telas cruas originais:
- Testes 1 e 6: resultados identicos aos originais (etapa extra, estado
  de espera, consistencia com o mapa), com ganho de fidelidade provado:
  reactions vivem em INSTANCIAS de botao remotas e o extrator le o
  rotulo do gatilho do texto interno da instancia.
- Teste 3: item-lista remoto com texto bindado dentro de secao de
  altura fixa; Revisor aprovou MG e reprovou o federal com a metrica
  corrigida, incluindo o caso de override de texto em instancia remota.
Bateria 6/6 valida em condicoes de fidelidade total.

## Regua de fidelidade e proximo nivel

A bateria 6/6 vale no NIVEL 2 (Mini DS). O nivel 3 (IDS real) e
validado pela bateria de fumaca do docs/runbook-banco.md, que e a
PRIMEIRA atividade no ambiente do banco, antes de qualquer construcao.

## Testes 7 e 8: riscos residuais atacaveis no lab

| # | Teste | Resultado |
| --- | --- | --- |
| 7 | Override bindado em aninhamento profundo (nivel 4, instancia > instancia > instancia > texto, via lib remota) | PASSOU: binding aceito e trocando por mode nos niveis 3 e 4; edicao direta de .characters em texto aninhado tambem funcionou (a falha silenciosa documentada pela comunidade NAO se reproduziu; setProperties segue como caminho preferencial) |
| 8 | Consumo simultaneo de 3 bibliotecas (componentes + icones + tokens em arquivos separados) | PASSOU: variavel remota importada por key (importVariableByKeyAsync), icone remoto, componente remoto, todos numa composicao; TOKENS DE LIB PUBLICAM NO PLANO PRO (achado de infra) |

Verificacao da convencao underscore: _interno/linha-detalhe ficou
UNPUBLISHED apos o publish (bloqueio confirmado); card-contrato CURRENT.
A convencao de secao interna esta validada no mecanismo real.

Status da regua de fidelidade: os riscos residuais 1 (aninhamento) e 2
(multi-lib) foram validados no nivel 2.5 (mecanismo real via libs
remotas, escala reduzida). Permanecem exclusivos do nivel 3: escala
real do IDS, rate limits corporativos, restricoes de ambiente e
Copilot corporativo. O item 5 do runbook do banco continua obrigatorio,
agora com expectativa de sucesso fundamentada.

## Teste 9: 4 componentes novos no Mini DS + etapa Consentimento nova, via biblioteca remota

4 componentes criados no Lab - Mini DS: `aviso-consentimento`,
`banner-alerta` (variant Severidade: informativo/atencao/erro),
`campo-texto` (variant Estado: padrao/erro), `radio` + `linha-radio`.
Publicados pelo designer.

Primeira tentativa do teste de fluxo completo foi feita ERRADA: dentro
do proprio arquivo Mini DS (referencias + template + collection
locais). Corrigido: aquele conteudo foi apagado do Mini DS (que deve
ficar so com o "IDS de exemplo", nunca com telas de consumo) e o teste
foi refeito no arquivo certo, Lab - Consignado Piloto, com componentes
REMOTOS (`importComponentByKeyAsync`, biblioteca Mini DS ja publicada
e habilitada la).

Etapa escolhida: `consentimento/tpl-consentimento`, que ainda nao tinha
template no Piloto (so existe hoje para c4-federais; R1 de
docs/clusters/c1-mg.md diz que esse convenio nao tem essa etapa). A
collection `conteudo-consignado` ja tinha as 4 variaveis certas
(`consentimento/titulo`, `consentimento/descricao`,
`consentimento/mostra-aviso`, `consentimento/texto-aviso`) sem
template nenhum consumindo elas ainda.

Bindings: titulo e descricao via `setBoundVariable('characters', var)`
direto no texto (nao sao property de componente, sao texto proprio da
tela); `mostra-aviso` via `setBoundVariable('visible', var)` na
instancia do `aviso-consentimento`. `texto-aviso` NAO foi bindado:
seu valor e identico nos 2 modes hoje, e por doutrina (docs/modelo-
clusters.md) texto identico entre clusters nao vira variavel; foi
setado literal.

Resultado: PASSOU. As 2 instancias pinadas por mode (c1-mg,
c4-federais) renderizaram corretamente; validateLayout limpo nas duas
(0 cortes, 0 sobreposicoes, 0 fontes faltando).

Achados novos:
- `setBoundVariable('characters'|'visible', var)` em TEXT ANINHADO
  dentro de uma instancia REMOTA falha ("Node ... not found") quando o
  no esta invisible no momento do binding — o proprio `.children` da
  instancia retorna vazio enquanto ela esta invisible. Contorno: pinar
  um mode explicito no no (`setExplicitVariableModeForCollection`) que
  deixe o no visible, editar, depois `clearExplicitVariableModeForCollection`.
  Reforca a doutrina PROPERTY FIRST (docs/modelo-clusters.md): texto
  que precisa variar deveria ser exposto como component property, nao
  no interno, especialmente em componente remoto.
- A versao c1-mg do `tpl-consentimento` renderiza com titulo e
  descricao vazios (os valores hoje sao string vazia para c1-mg, ja
  que a etapa nao existe nesse cluster). Achado em 2 partes:
  (a) o fato de ter conteudo vazio nao e bug — e o sintoma correto de
  usar um template fora do cluster a que ele pertence, e confirma por
  que "composicao de fluxo" tem que vir do MAPA DE FLUXO, nunca do
  conteudo de uma variavel; (b) mas a tela renderizou com um VAO VISUAL
  feio no topo, e ISSO era bug de verdade: texto com characters=""
  ainda ocupa altura de uma linha e o auto layout ainda aplica o
  itemSpacing ao redor dele porque o no continua visible=true. Bindar
  so o characters nao basta quando o valor pode ficar vazio. Corrigido
  agrupando titulo+descricao num frame "cabecalho" e bindando o
  VISIBLE DO FRAME a `consentimento/mostra-aviso` (mesmo boolean que ja
  controlava o aviso, eixo 4, sem inventar variavel nova); depois da
  correcao a versao c1-mg colapsa limpo (356px -> 230px de altura, sem
  vao). Regra nova em montador.agent.md: texto que pode ficar
  vazio por cluster precisa ter a visibilidade de um ancestral bindada
  tambem, nao so o characters.
- Achado de dados: a variavel `fluxo/tem-consentimento` (e
  `fluxo/tem-anuencia-externa`) ja existe na collection
  `conteudo-consignado` do Piloto, mas docs/modelo-clusters.md cita
  literalmente esse nome como exemplo do anti-padrao a evitar ("NUNCA
  duplicar composicao como boolean de variavel, ex: fluxo/tem-
  consentimento"). Bandeira levantada para o designer decidir: manter
  como esta, ou remover/depreciar essas 2 variaveis quando o mapa de
  fluxo formal existir.
- Falso alarme investigado e resolvido: o `aviso-consentimento` usado
  dentro de `tpl-simulacao` (template pre-existente) nao e um
  componente duplicado do que criei no Mini DS — e uma instancia de
  `banner-desconto` renomeada por PAPEL (convencao ja documentada em
  docs/receitas/_comuns.md). Confirmado via getMainComponentAsync().name.
- Auditoria pos-construcao (Passo 2 do comparador: characters +
  boundVariables de todo TEXT) achou 2 gaps reais no
  `tpl-consentimento`, ambos de TECNICA de construcao, nao de
  mecanismo novo: (a) header-fluxo.Titulo ficou no default do
  componente ("Credito consignado") em vez do nome da etapa
  ("Autorizacao de dados", seguindo o padrao de tpl-simulacao que seta
  "Simulacao"); (b) o texto do linha-checkbox foi setado editando o
  no de texto direto em vez de instance.setProperties('Texto#3:4', ...)
  — mesmo sendo um valor literal correto (nao varia por cluster), usar
  setProperties evita a classe de bug de no-interno-remoto ja
  documentada acima. As duas corrigidas.

Nivel de fidelidade: 2.5 (mecanismo real via lib remota publicada,
arquivo separado, escala reduzida — nao e o IDS do banco ainda).

## Teste 10: primeiro ciclo real com os 3 agentes (nao simulado pelo coordenador)

A pedido do designer, o Lab - Consignado Piloto foi ZERADO por completo
(todas as paginas, todas as variable collections locais; bibliotecas
conectadas mantidas) para rodar o ciclo de ponta a ponta usando os
agentes de verdade — ate aqui, quem tinha feito comparacao/binding no
lugar deles era o coordenador (Claude Code), so inspirado nos arquivos
dos agentes. Isso mudou: cada etapa abaixo foi um agente real,
disparado via subagente, lendo sozinho `.github/agents/*.agent.md` e a
skill correspondente, sem o coordenador executar use_figma em nome
dele.

Etapa escolhida: simular-e-contratar (ambos os clusters tem essa
etapa, evita a questao de composicao de fluxo do consentimento).

1. Coordenador construiu 2 referencias cruas (papel do designer, ja
   que ninguem mais ia desenhar nesta sessao): ref-simulacao-c1-mg e
   ref-simulacao-c4-federais, com componentes remotos do Mini DS,
   textos digitados a mao, sem variavel nenhuma.
2. Agente `comparador` (real): comparou as 2 referencias, produziu
   matriz de variacao completa e propos schema de 5 variaveis. Achou 2
   divergencias sem regra documentada (rotulo do campo-valor menciona
   nome do convenio; tom do texto do seguro muda entre clusters) e um
   ponto de atencao sobre taxa/parcela do totalizador poderem ser dado
   de runtime em vez de conteudo de design.
3. Designer revisou e decidiu: faixa-valor fica como string unica
   (nao decompor em number); taxa/parcela do totalizador SAO dado de
   runtime, ficam fora do schema; a divergencia do texto do seguro tem
   resposta real do designer (nao e so tom — o seguro literalmente nao
   existe no cluster 5), o que virou regra nova documentada em
   docs/clusters/c1-mg.md (R3 confirmada, R5 nova) e
   docs/clusters/c4-federais.md (R7, R8 novas).
4. Agente `montador` (real): criou a collection
   `conteudo-consignado` (2 modes) com as 4 variaveis aprovadas,
   clonou e componentizou `simular-e-contratar/tpl-simulacao`, bindou
   property-first (3 TEXT) + visible do no (1 BOOLEAN, sem property
   exposta pelo item-lista para isso), aplicou o carimbo, criou 2
   instancias de preview pinadas por mode. Rodou teste de equivalencia:
   c1-mg bateu 15/15; c4-federais NAO bateu na primeira rodada (13/15,
   diferenca no totalizador) — o agente PAROU e reportou em vez de
   decidir sozinho, exatamente como a doutrina manda. Causa: valores de
   exemplo arbitrarios e diferentes que o coordenador tinha digitado
   nas 2 referencias cruas para um campo ja combinado como fora do
   schema. Coordenador corrigiu a referencia crua (mesmo valor de
   exemplo nos 2 clusters) e retomou o agente via SendMessage; segunda
   rodada bateu 15/15 nos dois modes.
5. Agente `validador` (real): validateLayout limpo nos 2 modes
   (0 cortes, 0 sobreposicoes, 0 fontes faltando, 0 texto bindado
   vazio), bindings conferidos property-first, carimbo conferido por
   re-varredura (bate com os boundVariables reais), remote:true em
   todas as instancias do IDS. 2 avisos, nenhuma reprovacao: (a) R3 de
   c1-mg.md cita tambem elegibilidade/mostra-portabilidade, que nao
   existe ainda (fora do escopo desta entrega, portabilidade nao fazia
   parte do schema aprovado); (b) R6 de c4-federais.md cita um nome de
   variavel (simulacao/valor-maximo) que diverge do que foi de fato
   implementado (simulacao/faixa-valor) — regra ainda nao ATIVA, nao
   reprova, mas vale alinhar o manual quando virar ATIVA.

Resultado: PASSOU, ciclo fechado ponta a ponta pelos 3 agentes reais.
Aprendizado principal: o agente montador seguiu a regra "pare e
reporte em vez de decidir sozinho" exatamente como esperado quando o
dado real das referencias contradisse uma premissa do schema aprovado
— a doutrina de checkpoints funcionou no primeiro teste real dela.

## Teste 11: Modo Fluxos do comparador + retroalimentacao real nos manuais

Dois objetivos nesta rodada: (1) testar o "Modo Fluxos" da skill
consignado-comparador (comparar grafos de prototipo, nao telas
isoladas) pela primeira vez de verdade; (2) testar se a resposta do
designer ao checklist volta pros manuais automaticamente (o
"retroalimentar" que o designer pediu), antes de formalizar isso como
regra permanente do agente.

Formato do checklist foi corrigido 2x nesta sessao antes deste teste,
a partir de feedback direto: primeiro "mecanico, sem contexto, nada
que ajude a decidir" (a pergunta nao mostrava o conteudo real de cada
cluster) -> depois "nao da pra ser em formato de tabela/comparativo?"
-> depois "nao tem referencia de qual e a tela". As 3 correcoes agora
sao regra na skill (secao Saida): tabela markdown, coluna `Onde` com
link/node de cada versao, coluna por cluster com o conteudo real,
nunca so a pergunta abstrata.

Cenario: etapa "anuencia", 2 paginas de fluxo cru conectadas por
prototipo (Fluxo-c4-federais: senha -> anuencia -> efetivacao, linear;
Fluxo-gov-sp: senha -> confirmacao ativa -> efetivacao, com um
desdobramento nivel 2 pendurado — escolha de canal SMS/e-mail, ida e
volta). Gov SP e convenio novo, citado pelo designer nesta sessao,
sem manual previo. Conteudo construido pelo coordenador como
placeholder para testar o mecanismo (nao e levantamento real do
convenio ainda).

Agente `comparador` (real, Modo Fluxos): extraiu o grafo das 2 paginas
via reactions, classificou por TOPOLOGIA (nao por rotulo de botao) —
nenhum RAMO DE EXCECAO, 1 DESDOBRAMENTO no Gov SP (o no de escolha de
canal, ida e volta). Achou 3 coisas:
1. Anuencia e 1 tela linear no Federal, 2 telas (principal +
   desdobramento) no Gov SP — divergencia estrutural, nao so de texto.
2. O TIPO de anuencia parece diferente: Federal e o orgao confirmando
   (cliente so aguarda), Gov SP e o cliente confirmando ativamente.
3. A referencia crua do Federal (construida pelo coordenador pra este
   teste) nao usa o mecanismo ja documentado em c4-federais.md R3/R4 e
   docs/mapa-fluxo-piloto.md (variant aguardando-anuencia do
   tpl-efetivacao, com card-contrato) — ficou simplificada demais.

Designer respondeu, primeira rodada: (1) tela de apoio opcional —
confirmado; (2) [resposta inicial mal-entendida pelo coordenador, ver
correcao abaixo]; (3) confirmado que a referencia esta incompleta (nao
e erro de regra de negocio, e simplificacao do teste).

**Correcao (mesma rodada, logo em seguida):** o coordenador escreveu o
achado 2 nos manuais como "sao dois processos de negocio diferentes
que so compartilham o nome por coincidencia". O designer corrigiu:
NAO — e a MESMA etapa (Anuencia), so que o gov-sp tem MAIS PASSOS
dentro dela (confirmacao ativa + escolha de canal) do que o
c4-federais (so espera passiva). E o eixo 3 (composicao de fluxo) que
o mapa ja modela em outras linhas (nivel 2 presente num cluster,
ausente noutro) — nao precisava de uma etapa nova, so de uma linha
nivel 2 a mais pendurada na etapa que ja existia. Isso e o achado mais
importante da rodada: nao foi o comparador que errou (ele so reportou
a divergencia estrutural, fato observado); foi a INTERPRETACAO do
coordenador sobre esse fato que errou, ao escrever a conclusao mais
forte ("processos diferentes") direto no manual sem marcar como
[VERIFICAR COM DESIGNER] antes de aplicar. Licao: quando o achado do
comparador inclui uma interpretacao (nao so o fato bruto), a
interpretacao TAMBEM precisa ser confirmada antes de virar regra —
nao so o fato.

Retroalimentacao aplicada nos manuais (pelo coordenador, ainda nao
pelo agente formalmente — este era o teste), corrigida apos o
feedback:
- `docs/clusters/gov-sp.md` criado do zero: R1 (a etapa Anuencia e a
  mesma do c4-federais, com mais passos aqui) e R2 (escolha de canal,
  nivel 2 opcional), ambas ATIVA.
- `docs/mapa-fluxo-piloto.md`: coluna `gov-sp` adicionada; UMA linha
  nivel 1 "Anuencia" (presente em c4-federais e gov-sp, comportamento
  interno diverge) + UMA linha nivel 2 "Canal de confirmacao" so em
  gov-sp — nao duas etapas nivel 1 separadas como na primeira versao.

Resultado: PASSOU nos dois objetivos, com uma correcao no meio do
caminho. O Modo Fluxos capturou uma divergencia estrutural real que
comparacao de conteudo isolado teria escondido — isso o comparador
acertou. A retroalimentacao manual funcionou tecnicamente (escreveu
nos arquivos certos, no formato certo), mas expos um risco real: o
coordenador aplicou uma INTERPRETACAO do achado como se fosse o
proprio achado, sem checkpoint extra. Isso precisa entrar na doutrina
antes de formalizar retroalimentacao automatica no agente: distinguir
"fato observado" (pode ir direto pro checklist) de "interpretacao do
fato" (precisa de uma pergunta propria, nao pode virar regra junto
com a confirmacao de outra coisa).

## Teste 12: densidade de conteudo (accordions) e leitura via componentProperties, nao screenshot

A pedido do designer ("as telas precisam ser mais complexas"), o fluxo
de anuencia do c4-federais foi reconstruido bem mais denso (passo-
tracking + card-contrato + banner-alerta + item-colapsavel + tag
combinados na mesma tela, altura fixa 360x812 real de dispositivo em
vez de abraçar o conteudo, corpo com FILL vertical empurrando o
rodape pro fim da tela) e ganhou um ramo de excecao real (anuencia
negada, nao so ida-e-volta).

Dois bugs de construcao encontrados e corrigidos no caminho, ambos
achados do proprio designer olhando o arquivo:
- Frames sobrepostos (varios top-level frames na mesma posicao X) —
  erro de nao calcular a posicao livre antes de posicionar, exatamente
  a regra 13 da propria skill figma-plugin-api que nao foi seguida.
  Corrigido reposicionando em linha, sem sobreposicao.
- Telas com 300-400px de altura (abraçando o conteudo) em vez de
  altura real de dispositivo (812px) — corrigido fixando
  primaryAxisSizingMode/counterAxisSizingMode = FIXED em 360x812 e
  fazendo o corpo expandir (FILL vertical) pra empurrar o rodape pro
  fim da tela, como um app de verdade.

Depois, o designer pediu uma tela com MUITOS accordions, icones
diferentes por tema, conteudo variando por cluster — pra testar se o
montador consegue ler o conteudo de accordions FECHADOS, nao só
os abertos. Isso expos que `item-colapsavel` nao tinha slot de icone
(adicionado agora: property `Icone` INSTANCE_SWAP, nos dois variants,
publicada junto com 4 icones novos — calendario, escudo, cadeado,
sino). Construidas 2 telas (`tpl-termos-detalhados`): c1-mg com 5
accordions, c4-federais com 6 (5 iguais + "Consentimento e uso de
dados" exclusiva), uma expandida e o resto fechado em cada.

Teste principal: auditoria via `componentProperties` em TODAS as
instancias de accordion (abertas e fechadas) confirmou que o valor da
property `Conteudo#7:3` esta sempre presente e legivel, mesmo quando o
variant ativo e `Estado=fechado` e o no de texto correspondente NAO
EXISTE naquele variant. A property vive na instancia, nao no variant
visivel. Resultado: o comparador/montador nunca dependem de
screenshot pra ler conteudo de accordion fechado — leem
`componentProperties` direto, que sempre tem o valor real. Regra
adicionada ao Passo 2 da skill consignado-comparador.

Achado registrado, nao corrigido ainda: a seta indicadora do
`item-colapsavel` parece invertida (variant aberto mostra seta pra
baixo, fechado mostra seta pra cima — o esperado seria o contrario).
Bug do componente ja existente, nao introduzido nesta sessao.

Resultado: PASSOU. Validou tanto a correcao de 2 bugs de construcao
reais (sobreposicao de frame, altura de tela irreal) quanto a hipotese
tecnica de que accordion fechado nao esconde dado do agente, so da
tela.

## Teste 13: MODO ARQUEOLOGIA — arquivo sujo, do jeito que o designer real entrega

Primeiro teste real do Modo Arqueologia (existia na skill desde o
inicio, nunca tinha sido exercitado). Pergunta do designer: "se eu
pegar o arquivo puro hoje, tem gente que quebra componente do IDS, nao
nomeia camada, faz auto layout de outro jeito... como testamos isso?"

Construida uma "gemea suja" da tela de simulacao (`Frame 42`, node
121:404, representando um cluster gov-sp): VISUALMENTE quase identica
a `ref-simulacao-c1-mg` (68:94, construida limpa), mas com 8 defeitos
plantados de proposito: raiz sem auto layout (posicionamento absoluto,
espacamentos na mao), header/campo-valor/oferta-portabilidade
DETACHED (componente do IDS quebrado), nomes de camada default (Frame
42, Group 12, Frame 51), instancia nao renomeada pelo papel (ficou
`item-lista` em vez de `oferta-seguro`), cores hardcoded sem token,
`textAutoResize = NONE` num texto candidato a variavel, tag escondida
via `visible=false` em vez de property. Mais uma divergencia de
CONTEUDO real (teto de R$ 60.000 vs R$ 50.000) pra ver se o agente
separa conteudo de ruido.

**Achado 1 — validateLayout NAO detecta ma construcao.** Rodado nas
duas telas: a limpa passou, e a SUJA TAMBEM passou (`passed: true`),
so marcou 1 aviso de noAutoLayout. Nao pegou detached, nem hardcoded,
nem nome de camada. Isso NAO e falha do script: validateLayout mede
QUEBRA VISUAL/geometrica, e a tela suja nao esta visualmente quebrada
— esta mal construida, que e outra categoria. Separacao de papeis
confirmada: qualidade de construcao e trabalho do comparador (Passos
2, 3 e 6), nao do validador geometrico. Registrar isso evita a
armadilha de achar que "passou no validateLayout" significa "pronto
pra variabilizar".

**Achado 2 — o comparador pegou os 8 defeitos plantados, e mais 5 que
nao foram plantados de proposito**, cada um com node ID e impacto real
declarado: (a) a camada TEXT do header detached ficou com nome preso
no conteudo antigo ("Credito consignado") enquanto o characters e
"Simulacao" — prova pratica da regra de nunca localizar texto por nome
de camada, porque comparar por nome teria reportado uma divergencia de
conteudo que nao existe; (b) a tela suja nao tem a anatomia de
container da receita (`corpo`, `acao-rodape`) — ou seja, mesmo
re-instanciando tudo ela ainda NAO viraria o mesmo template, o que e
um achado mais profundo que os detach isolados; (c) 225px de espaco
morto entre blocos, consequencia do posicionamento manual; (d) o mode
`gov-sp` nem existe na collection; (e) nuance: os detached
PRESERVARAM a maioria dos tokens (o designer copiou de uma instancia
boa), so 3 nos perderam — o agente reportou isso como "boa noticia"
em vez de tratar tudo como perda total.

**Achado 3 — separacao conteudo x ruido funcionou.** O agente entregou
duas secoes distintas: tabela comparativa so com as 4 divergencias de
CONTEUDO (viram variavel) e uma secao separada de ALERTAS DE
CONSTRUCAO (viram divida tecnica), com veredito explicito ao final:
"NAO esta pronta para o montador", com lista ordenada de 8
correcoes e a distincao entre pre-requisito duro (itens 1-5, 8) e
dependente de decisao do designer (6, 7).

**Lacuna de doutrina exposta (nao resolvida ainda):** nenhum agente
hoje TEM O PAPEL de sanear uma tela suja. O comparador so reporta
(somente leitura, por design). O montador so binda a partir de
referencia + schema aprovados, e a doutrina dele diz explicitamente
que as referencias do designer ficam INTACTAS (sao o contrato de
validacao). O proprio agente levantou isso na saida: "se preferir, o
montador pode fazer 1-5 e 8 como passo de saneamento antes de
bindar — mas alguem tem que fazer, e nao pode ser depois do bind".
Decisao pendente do designer: quem sanea? Opcoes: (a) o designer
corrige a mao antes de chamar o comparador; (b) o montador ganha
um modo saneamento explicito; (c) um agente novo so pra isso.

Resultado: PASSOU, com folga. O Modo Arqueologia funciona em fonte
suja real, e o valor dele nao e so achar defeito — e separar defeito
de divergencia legitima, que e a decisao que trava o processo se
alguem errar.

## Teste 14: fonte HOSTIL — detach + modificacao estrutural. O limite epistemologico do saneamento

O designer apontou que o Teste 13 foi facil demais: os blocos foram
destacados mas nao MODIFICADOS, entao a identificacao da origem era
trivial (estrutura intacta = assinatura intacta). Pergunta dele: "e se
tiver diferenca na ordem? quero entender realmente como ele vai criar
a tela sanitizada".

Construida uma tela genuinamente hostil (`simulacao SP v2 FINAL ok`,
node 126:430): header destacado COM O BOTAO FECHAR DELETADO e fonte
trocada (16/Medium em vez de 14/Semi Bold); `campo-valor` destacado e
REORDENADO (faixa movida para o topo, antes do rotulo); `item-lista`
destacado com o ICONE DELETADO e um selo de preco inventado no lugar;
um bloco de resumo em 2 colunas construido DO ZERO, sem par estrutural
em componente nenhum; tipografia fora da escala; cores cruas; uma
instancia intacta (portabilidade) para contraste.

**Achado 1 — a identificacao funciona mesmo com estrutura modificada,
e o agente declarou o metodo.** Como a `mainComponent.key` morre no
detach, ele usou tres evidencias em ordem de forca: (i) keys de
instancias do IDS que SOBREVIVERAM dentro do bloco (inquestionavel —
ex: o `icone/seta-esquerda` dentro do header destacado, a `tag` e a
`acao` dentro do item-lista destacado); (ii) assinatura geometrica do
container (layoutMode, gap, padding, alinhamento, largura); (iii)
impressao digital tipografica dos filhos em ordem. Exemplo concreto de
(iii): identificou o `campo-valor` pela regua de **200x2 px**, que e
digital unica na lib inteira.

**Achado 2 — declarou confianca honestamente, incluindo "nao sei".**
ALTA para 3 blocos (com evidencia citada), MEDIA para o resumo em 2
colunas (explicando que a identificacao e posicional/semantica, nao
prova de proveniencia: "nao afirmo que e uma reconstrucao do
totalizador; afirmo que ocupa o papel dele"), e **BAIXA — declaro que
nao sei** para o selo de preco inventado, recusando explicitamente
chutar que veio do `tag` apesar da semelhanca superficial
("semelhanca de conceito nao e evidencia de origem").

**Achado 3 — usou um artefato nao declarado como elo de cadeia.**
Encontrou sozinho o frame do Teste 13 (121:404, mesma tela de SP,
destacada mas NAO modificada) e o usou como "fossil intermediario":
prova de qual componente cada bloco era antes de ser mexido. Tambem
levantou a pergunta certa: qual das duas telas e a canonica de SP?

**Achado 4 — achou um defeito geometrico EMERGENTE que nao foi
plantado.** Sobreposicao real de 6px entre o card de seguro e a oferta
de portabilidade. Causa em cadeia: o selo de preco roubou largura do
frame de texto (91px contra 166px no original) -> os dois textos
quebraram em 2 linhas cada -> o card cresceu de 74 para 106px -> numa
raiz com auto layout isso empurraria o irmao, mas numa raiz NONE,
sobrepos. Detectado por `absoluteBoundingBox`, nao por screenshot.

**Achado 5 (O PRINCIPAL) — o limite e epistemologico, nao tecnico.**
Citando o agente: *"no Figma, uma decisao deliberada e um descuido
produzem BYTES IDENTICOS. O arquivo nao guarda intencao."* Nao existe
melhoria de prompt, modelo ou script que resolva isso. Ele so tem 3
discriminadores, e nenhum enxerga intencao: (a) regra ja escrita no
manual do convenio; (b) consistencia interna entre artefatos do mesmo
cluster; (c) natureza da divergencia (carrega conteudo de negocio ou e
pura forma?).

Classificou com seguranca como ERRO (nenhuma regra de convenio poderia
justificar, porque tipografia e engenharia de layout nao sao eixos de
variacao em docs/modelo-clusters.md): raiz sem auto layout, ausencia de
`corpo`/`acao-rodape`, tipografia fora da escala, cores cruas, a
sobreposicao, os nomes de camada.

Classificou com seguranca como VARIACAO DE CONTEUDO (sustentada por
documento existente): texto do seguro (R5 de c1-mg.md ja registra que
o tom varia) e o teto de R$ 60.000 (a variavel `simulacao/faixa-valor`
existe por contrato da etapa).

E listou 9 casos que NAO consegue decidir sozinho, com a pergunta que
faria em cada um — entre eles: taxa original ausente (SP nao tem taxa
promocional, ou o designer esqueceu de recriar a linha?), faixa acima
do rotulo (proposta consciente de UX, ou consequencia de remontar na
mao?), botao fechar ausente, icone ausente, selo de preco.

Nota de metodo que o proprio agente declarou: *"eu nao uso 'esta mais
bonito' como evidencia de deliberacao, e nao uso 'quebrou a doutrina'
como evidencia de erro em coisa que carrega conteudo. Se eu fizesse
isso, transformaria a ausencia da taxa original em 'erro' so porque e
mais facil normalizar — e apagaria uma regra de negocio real."*

**Achado 6 — o desenho do saneador caiu por gravidade.** Perguntado o
que um agente saneador conseguiria fazer sozinho, separou:

ZONA SEGURA (deterministica, nada a decidir): reconstruir a anatomia
da receita (o que resolve a sobreposicao e o espaco morto POR
CONSTRUCAO, sem decidir nada), reinstanciar os componentes com os
valores literais ja apurados, preservar as instancias que ja estavam
limpas, e eliminar tipografia/cor hardcoded (some por consequencia do
reinstanciar, nao e decisao).

ZONA DE PARADA (carrega intencao de negocio): taxa original ausente —
e um bloqueio TECNICO alem de editorial, porque a variante do
totalizador TEM o no de taxa original, entao instanciar forca uma de
tres saidas ruins (inventar valor = proibido; deixar vazio = viola a
regra 11, texto vazio nao e no ausente; escolher outra variante que
ele nao sabe se existe). Mais: rotulos fixos do totalizador (nao tem
property, exige evolucao do componente), selo de preco (sem slot no
IDS), aviso legal (risco juridico nos dois sentidos), qual dos dois
frames e a fonte, e se isso vira mode ou template separado.

**A frase que fecha o desenho**, do proprio agente: *"com os defaults
seguros ele produziria uma tela estruturalmente identica ao template
de MG com strings de SP — e, no caminho, apagaria em silencio as cinco
decisoes que podem ser variacao real de SP. Reconstruir tudo sem
perguntar e mais destrutivo que deixar a tela suja: a tela suja pelo
menos preserva a evidencia."*

Resultado: PASSOU, e o teste valeu mais pelo que ele NAO conseguiu
fazer do que pelo que conseguiu. A conclusao de arquitetura e que
saneamento automatico total e indesejavel por natureza, nao por
imaturidade da ferramenta — o saneador tem que ser explicitamente
PARCIAL, com uma fronteira declarada entre o que e forma (pode
normalizar) e o que carrega intencao (tem que perguntar).

## Teste 15: aninhamento profundo, nomenclatura ruim e composicao local do designer

Tres perguntas do designer nesta rodada, todas sobre o mesmo medo de
fundo ("tenho medo de nao conseguir recriar a tela corretamente e
ficar tudo torto"): (1) como o agente sabe MEXER num componente do
IDS que ele nao construiu, com muitas properties e variantes?
(2) e se o componente estiver com nomenclatura ruim? (3) e quando o
designer faz composicao local, com espacamento digitado na mao —
conseguimos ler o valor que ele definiu?

**Parte 1 — aninhamento de 4 niveis.** Criado no Mini DS um
`card-financeiro-completo` (nivel 1) contendo 3x `linha-financeira`
(nivel 2), cada uma contendo `indicador-valor` (nivel 3, variant
Estado=alta/baixa/neutro), contendo um icone (nivel 4). DE PROPOSITO as
properties dos niveis internos NAO foram expostas no topo — ficaram
"enterradas". Resultado: varredura recursiva de `componentProperties`
achou as 10 instancias nos 4 niveis, com caminho completo
("card > linha-1 > indicador"), tipo, valor atual e node ID de cada
property. Profundidade nao e obstaculo: a property vive na instancia
aninhada e e legivel de qualquer nivel. Conclusao importante: o agente
NAO "entende" o componente semanticamente — ele le metadado que o Figma
expoe (nome da property, tipo, valor). Nao precisa entender pra operar.

**Achado tecnico 1:** o `mainComponent.name` de uma instancia de
VARIANT retorna o nome da VARIANTE ("Estado=alta"), nao o nome da
familia ("indicador-valor"). Leitura ingenua reportaria o componente
com nome errado. Precisa olhar `mainComponent.parent.name` para
variantes. Ja coberto pela regra 34 (resolver por key, nao por nome),
mas vale como caso concreto.

**Parte 2 — nomenclatura ruim.** O designer confirmou que o IDS real
tem "nomes inconsistentes, alguns bons alguns ruins, poucas
descricoes". Criado `Comp/Notif v2` (nome versionado) com properties
deliberadamente pessimas: `Txt`, `Label 2` (label 1 nao existe),
`Show` (mostrar O QUE?), `Icn`, variant `Type` com valores `1|2|3`
(sem significado), camadas nomeadas `i` e `Frame 2`, e SEM descricao no
componente. Conclusao (parcialmente teorica, o teste completo com o
agente ficou pendente): a leitura MECANICA continua funcionando —
tipo, valor e estrutura sao garantidos pelo Figma. O que degrada e a
capacidade de PROPOR nome de variavel e de julgar intencao: o agente ve
`Type: 1|2|3` e sabe que existem 3 opcoes e qual esta ativa, mas nada
no arquivo diz o que "1" significa. A qualidade da proposta depende da
nomenclatura do IDS, nao da capacidade do agente. Consequencia pratica:
com IDS mal nomeado, esperar MAIS perguntas [VERIFICAR COM DESIGNER],
nao respostas erradas — o que e o comportamento correto.

**Parte 3 — composicao local e valor na mao.** Criado no arquivo do
Piloto um COMPONENTE LOCAL do designer (`meu-card-resumo`, remote=false,
nao vem do IDS) com espacamento 14, padding 18/20, radius 10 e cor
#f7f7fa — todos digitados na mao, nenhum token. Pergunta do designer:
"temos como pegar o valor que ele definiu, ne?" Resposta: SIM, sempre.
A API retorna o numero literal independente de estar bindado; o
`boundVariables` diz se e token ou hardcoded. Montada uma auditoria de
aderencia que cruza os dois.

**Achado tecnico 2 (importante):** `getLocalVariableCollectionsAsync()`
retornou LISTA VAZIA de tokens no arquivo consumidor — porque ela so ve
collections locais, e no Piloto todos os tokens vem de lib remota. Para
enumerar token de biblioteca e obrigatorio usar
`figma.teamLibrary.getAvailableLibraryVariableCollectionsAsync()` +
`getVariablesInLibraryCollectionAsync()`. Sem isso, qualquer auditoria
de aderencia a token da falso negativo silencioso. Virou regra 19a.

**Achado tecnico 3 (o mais sutil):** a primeira versao da auditoria
casou o `itemSpacing = 14` com o token `primitivos/tipo/corpo`, que e
um token de TAMANHO DE FONTE de valor 14 — sugerindo trocar espacamento
por tipografia. Bug de casar por valor numerico ignorando o SCOPE do
token. Num IDS real com centenas de tokens numericos, colisao de valor
e a regra, nao a excecao. Corrigido: cada propriedade so casa com token
do scope certo (GAP para espacamento, CORNER_RADIUS para raio,
FONT_SIZE para fonte). Virou regra 19b. Com a correcao, a saida ficou
acionavel: "itemSpacing 14 HARDCODED e FORA DA ESCALA (escala valida:
4/8/12/16/24/32; mais proximo: 12)".

**Doutrina nova (Passo 2b da skill consignado-comparador):** como tratar
composicao/componente local do designer. Tres destinos possiveis, e o
agente NAO decide qual — apresenta evidencia e pergunta: (a) DUPLICA
algo que ja existe no IDS -> substituir por instancia; (b) e NOVO e
reutilizavel (aparece em 2+ telas/clusters) -> candidato a promover pro
IDS, pedido ao dono do DS; (c) e composicao de uso unico -> pode ficar
local, mas tem que usar token. Nunca recriar composicao como frame
solto dentro de template publicado.

Resultado: PASSOU nas 3 partes, com 3 achados tecnicos que viraram
regra. O medo do designer ("ficar tudo torto") tem endereco especifico
agora: nao e a profundidade do componente nem o tamanho do IDS — e a
qualidade da nomenclatura do IDS, que determina quantas perguntas o
agente vai ter que fazer em vez de propor sozinho.

Pendente desta rodada: rodar o agente comparador de verdade contra o
`Comp/Notif v2` (nomenclatura ruim) numa tela real de 2 clusters, pra
medir na pratica quantas perguntas ele faz e se erra alguma proposta.
Os componentes novos deste teste (card-financeiro-completo,
linha-financeira, indicador-valor, Comp/Notif v2) precisam ser
publicados pelo designer antes.

## Teste 16: MODALIDADE e estrutura ou variavel? (a premissa nunca testada)

Premissa afirmada em docs/modelo-clusters.md desde o inicio do projeto,
usada em toda skill e agente, e NUNCA verificada: "modalidade e
ESTRUTURA, nunca variavel" (primeira concessao vs refinanciamento sao
fluxos com estruturas distintas). Se estivesse errada, os 4 eixos de
variacao cairiam junto.

Desenho do experimento (o mais limpo da bateria ate aqui): construida
`ref-simulacao-refin-c1-mg` (node 135:455) — MESMA etapa
(simular-e-contratar), MESMO cluster (c1-mg), mesma modalidade de
caminho (feliz). A UNICA variavel do experimento e a modalidade.
Cluster controlado = nenhuma diferenca encontrada pode ser explicada
por convenio.

**Veredito: doutrina CONFIRMADA, com correcao importante no
raciocinio.**

A doutrina diz "estruturas distintas", o que sugere telas sem nada em
comum. A medicao mostra o contrario: o CHASSI e 100% compartilhado
(header-fluxo, campo-valor, totalizador com o mesmo variant, botao com
o mesmo variant, mesma ordem vertical header -> corpo -> totalizador ->
rodape; todas as instancias remote=true, zero [LOCAL], zero detached, e
nenhum componente novo necessario alem do card-contrato que ja existia).
A formulacao precisa passa a ser: **templates separados, componentes
compartilhados**. Separar template e correto; usar isso como desculpa
pra reconstruir o chassi na mao em cada template nao e.

**O argumento decisivo e ARITMETICO, nao doutrinario** (e este e o
achado que vale registrar): modes sao um eixo UNICO por collection. Se
modalidade tambem virasse mode, os modes teriam que ser o PRODUTO
CARTESIANO cluster x modalidade — `c1-mg-primeira`, `c1-mg-refin`,
`c4-primeira`, `c4-refin`: 4 modes com apenas 2 clusters, ja no teto do
plano Professional. Com os 5 clusters do projeto: 10 modes em vez de 5.
Como o limite de modes e a restricao de plano mais dura e ainda nao
verificada no banco, gastar o eixo de modes com modalidade e o pior uso
possivel dele.

A regra que sai disso, em uma linha: **modalidade e etapa multiplicam
TEMPLATE; cluster multiplica MODE; estado de UI e composicao de fluxo
nao multiplicam nenhum dos dois.**

    templates = SOMA_etapa (telas da etapa) x (modalidades que a etapa distingue)
    modes     = M (numero de clusters)   <- independente de etapa e modalidade

Teto de nivel 1: 4 etapas x 2 modalidades = 8 templates. Os 5 clusters
somam ZERO templates (sao 5 modes). Sem modes seria 8 x 5 = 40 templates
so em simular-e-contratar. Fator 5 de reducao, e onboarding de cluster
novo = uma coluna no mapa + um mode + preencher celulas, zero template.

**Achado inesperado — o refin tem quase nenhum conteudo de cluster.**
De 24 textos na tela de refin, praticamente tudo e dado de runtime
(saldo devedor, parcelas pagas, troco, taxas) ou rotulo fixo. O unico
candidato a variavel de cluster no refin inteiro e o prazo do troco
("cai na conta em ate 1 dia util"), e mesmo esse esta [CONFIRMAR]. Se
isso se repetir nos outros convenios, o template de refin pode ser
quase mode-independente — o que reforca de novo que modalidade nao
pertence ao eixo de modes.

**Achado colateral: a deriva ja comecou, e foi medida.** Os dois
`acao-rodape` foram construidos a mao com a mesma intencao e JA
divergiram: o da primeira concessao tem counterAxisSizingMode=FIXED com
altura 100 (28px de espaco morto, sintoma da regra 44), o do refin tem
AUTO com 72. Duas telas, uma etapa, um cluster, e a divergencia ja
aconteceu. Com 8+ templates isso vira ruido permanente. Justifica
extrair `_secoes/acao-rodape` com evidencia medida, nao com argumento
estetico. Ja o `composicao-troco` NAO deve virar secao ainda: so existe
em 1 cluster, e o criterio de reuso pede 2+.

**Lacunas de doutrina expostas (precisam de decisao):**
- `docs/estrutura-lib.md` nomeia template como `etapa/tpl-nome`. Isso
  NAO comporta modalidade. Opcoes: sufixo
  (`simular-e-contratar/tpl-simulacao-refin`) ou hierarquia por barra
  (`simular-e-contratar/refin/tpl-simulacao`). [CONFIRMAR com designer]
- `docs/etapas/simular-e-contratar.md` descreve so a primeira concessao.
  As 4 variaveis do contrato dele (simulacao/faixa-valor,
  oferta-seguro/texto-suporte, elegibilidade/mostra-seguro,
  elegibilidade/mostra-portabilidade) NAO tem alvo nenhum na tela de
  refin. O refin precisa de contrato proprio.
- `docs/mapa-fluxo-piloto.md` precisa de dimensao de modalidade: a
  sequencia de etapas do refin nao e a mesma.

**Defeitos de construcao que o agente pegou nas MINHAS telas:**
itemSpacing=20 no corpo do refin (fora da escala real: 4/8/12/16/24/32);
raiz da primeira concessao em AUTO (h=547) contra refin em FIXED (812) —
inconsistente, referencia de tela deveria ser 812 nas duas; 28px de
espaco morto no rodape da primeira concessao que o validateLayout nao
detecta.

Resultado: PASSOU. A premissa arquitetural mais fundamental do projeto
resistiu ao primeiro teste real, e ganhou um argumento melhor do que o
que estava escrito.
