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
