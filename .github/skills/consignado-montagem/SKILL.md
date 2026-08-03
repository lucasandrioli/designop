---
name: consignado-montagem
description: Monta a arvore-alvo de um template aprovado, com referencias cruas como evidencia, e so o promove apos validacao independente. Use no agente Montador, sempre depois da aprovacao humana.
user-invocable: true
disable-model-invocation: true
---

# Montagem de etapa

Esta skill e chamada manualmente com `/consignado-montagem`. Ela nao
substitui a aprovacao humana nem permite que uma referencia crua seja
promovida por parecer parecida com um template.

Siga o [Contrato de papeis](../../../docs/contrato-papeis.md). Montagem
nao decide regra, classificacao nem veredito de validacao; devolva a
pendencia ao papel responsavel.

Em chat novo, recupere catalogo, mapa, manuais, proposta aprovada e
veredito anterior antes de abrir a conversa. Se algum deles nao puder
ser localizado, diga qual e a unica pendencia real. Nunca substitua esse
contexto por uma lembranca ou resumo de conversa anterior.

## Recursos obrigatorios desta execucao

Leia estes recursos antes de qualquer chamada Figma. Os links existem
para que o Copilot carregue o conteudo e os arquivos auxiliares, nao
apenas reconheca seus nomes.

- [Plugin API do Figma](../figma-plugin-api/SKILL.md)
- [Reconstrucao Figma](../figma-reconstrucao/SKILL.md)
- [Validacao do consignado](../consignado-validacao/SKILL.md)
- [Validacao estrutural](../../../scripts/validateCreation.js)
- [Validacao de layout](../../../scripts/validateLayout.js)
- [Validacao do contrato de conteudo](../../../scripts/validateContentContract.js)
- [Validacao de comportamento por mode](../../../scripts/validateModeBehavior.js)
- [Validacao do contrato de reconstrucao](../../../scripts/validateReconstructionContract.js)
- [Validacao de interacao por contrato](../../../scripts/validateInteractionContract.js)
- [Validacao de organizacao do canvas](../../../scripts/validateCanvasOrganization.js)
- [Elegibilidade para promocao](../../../scripts/validatePromotion.js)
- [Taxonomia de nomes e carimbo](../../../docs/estrutura-lib.md)
- [Modelo de variaveis e modes](../../../docs/modelo-clusters.md)
- [Viewport-base](../../../docs/viewport-base.md)

Na primeira resposta, antes de escrever no Figma, abra uma conversa de
trabalho em linguagem natural. Diga o que ja esta aprovado, o que voce
vai conferir sozinho antes de montar e, se houver lacuna, peca somente a
proxima decisao que realmente bloqueia a rodada. Antecipe o que o
designer recebera e quem assume depois. Skills e scripts lidos entram
somente depois, no detalhe tecnico. Se faltar recurso ou entrada de
negocio, pare depois de explicar a pendencia de forma simples. Nao
troque essa abertura por uma promessa de que "vai seguir a skill" nem
por uma lista de todos os requisitos.

## Entradas obrigatorias

1. Proposta consolidada e contrato tecnico aprovados explicitamente pelo
   designer nesta conversa: template-base, especializacoes, schema de
   variaveis, arvore-alvo, mapa IDS, geometria e excecoes locais.
2. Catalogo da etapa, mapa de fluxo e manual de cada cluster em
   `docs/`.
3. Arquivo Figma, pagina de referencias e referencias por cluster
   informados pelo designer. A area de montagem e sempre a pagina
   `_verificacao-<etapa>`; se nao existir, crie-a somente depois da
   aprovacao.
4. Topologia decidida em `docs/topologia-biblioteca.md` e collection
   resolvida para a etapa.
5. Para promocao: relatorio mais recente do Validador dizendo `APTO
   PARA PROMOCAO` para cada rascunho indicado.

Liste todos os bloqueios de uma vez. Sem qualquer entrada, nao crie
tela, variavel, binding, componente ou documento oficial.

## Estado dos objetos

| Estado | Nome | Onde vive | Pode publicar? |
| --- | --- | --- | --- |
| Referencia humana | `ref-...` | pagina ou secao de referencias | nao |
| Material de construcao | `_rascunho-<etapa>-<nome>` | `_verificacao-<etapa>` | nao |
| Preview por mode | `preview-<cluster>-<template>` | `_verificacao-<etapa>`, sem prototipo | nao |
| Template aprovado | `etapa/tpl-...` | `_templates` | sim |

`ref-*` nunca e componentizado nem renomeado. O rascunho nasce da
arvore-alvo aprovada, e nao de clone. Clonar uma referencia so e
permitido para um asset visual que o contrato tenha indicado. O clone
nunca herda direito ao prefixo `tpl-*`.

## Fase A: contrato visual antes da escrita

1. Execute `prepararReconstrucao` para confirmar o frame exato, o
   conjunto de bibliotecas IDS ja confirmado na proposta e a unidade de
   montagem. Reutilize as `libraryKey` aprovadas nas buscas com
   `includeLibraryKeys`; nao chame `get_libraries` nem derive uma nova
   proposta nessa fase.
2. Execute `inspecionarReferencia` somente para conferir a evidencia e
   os papeis aprovados.
3. Execute `resolverIDS` e confirme key, property publica, variant e
   capacidade de composicao de cada escolha aprovada. Nunca invente keys
   como `Label` ou sufixos `#...`.
4. Pare se houver candidato `[CONFIRMAR]`, `SEM_EQUIVALENTE` sem excecao
   aprovada, token apenas parecido ou instancia IDS sem slot/property
   para a composicao declarada. `PROVA_DE_MONTAGEM` so pode continuar
   quando estiver nomeada e aprovada no contrato tecnico.
5. Registre o contrato tecnico aprovado no catalogo da etapa antes da
   primeira escrita no Figma. Ele nao recebe node IDs permanentes.
6. Confirme que toda escrita de rascunho e preview ocorrera em
   `_verificacao-<etapa>`, fora da pagina de referencias e fora de
   `Fluxos`. Se o plano aponta para outro lugar, pare.

## Fase B: montar somente o rascunho

1. Crie ou localize a pagina `_verificacao-<etapa>`. Preserve a pagina
   de referencias e `_templates` somente leitura durante a montagem.
2. Crie ou localize a collection e somente as variaveis semanticas do
   schema aprovado que uma `PROVA_DE_MONTAGEM` precisa exercitar. Se a
   prova falhar, remova apenas a variavel criada exclusivamente para ela.
3. Execute `provarMecanismo` para cada `PROVA_DE_MONTAGEM` aprovada. A
   prova usa somente `_prova-<papel>` dentro de `_verificacao-<etapa>`;
   nao toca referencias e nao inicia o rascunho completo se falhar.
4. Antes de criar, anexar ou editar texto, carregue as fontes reais
   de todos os nos textuais envolvidos. Fonte sem `family` e bloqueio,
   nao valor para substituir.
5. Execute `montarArvore`: crie o rascunho a partir da arvore-alvo com
   Auto Layout, sizing, padding, gap, ordem e sobreposicoes do contrato.
   Para uma tela mobile sem excecao declarada, a raiz mede `360 x 800`.
   Preserve tambem os papeis de layout especificos que o contrato
   declarar. Nao presuma rodape fixo, totalizador ou qualquer outra
   estrutura de uma etapa em telas que nao os declararam.
   Quando o contrato declarar rolagem ou filhos fixos, aplique o
   `overflowDirection` e mantenha os filhos fixos no fim da raiz, na
   ordem aprovada. Nao tente marcar cada filho individualmente: no
   Figma, a raiz define quantos filhos finais ficam fixos.
6. Importe instancias IDS pela key real. Ao chegar em `INSTANCE`, use
   somente property publica ou slot documentado. Nunca insira filho em
   instancia remota nem tente editar sua arvore interna.
7. Crie somente variaveis previstas no schema aprovado. Em collection
   por etapa, cada nome comeca com `<tela>/` e descreve o papel daquela
   tela. Em collection compartilhada, use `<etapa>/<tela>/`. Nunca
   reutilize `prop/*`, `teste-*`, `teste-props` ou variavel de outra
   etapa, mesmo que ela tenha o mesmo tipo BOOLEAN ou o mesmo valor. Modes sao
   clusters que usam a etapa. Ausencia de etapa pertence somente ao
   mapa.
8. Crie secao ou componente local somente se a excecao aprovada declarar
   esse papel. Componentize secoes aprovadas e depois o rascunho. Use
   property first nas instancias IDS, com as keys reais confirmadas na
   fase A. No interno e fallback documentado.
9. Aplique bindings estruturais e de conteudo no master. Texto bindado
   usa `textAutoResize` HEIGHT ou WIDTH_AND_HEIGHT. O master nunca
   recebe mode explicito.
10. Crie um wrapper de preview por cluster em `_verificacao-<etapa>` e
   aplique nele o mode do cluster. A instancia dentro do wrapper nao
   recebe override manual de conteudo. Preview nao recebe reaction nem
   faz parte de uma linha de fluxo.
11. Crie reacoes de prototipo somente quando estiverem declaradas no
   contrato de interacao aprovado. Cada acao aponta para o destino
   aprovado e usa retorno quando a jornada precisar voltar a tela de
   origem. Quando o contrato declarar movimento, aplique tambem o
   gatilho, atraso, tipo de transicao, duracao e Bezier exatos. Nao
   invente caminhos, tempos ou curvas para tornar a tela mais completa.

## Fase C: prova do rascunho

Ainda nao renomeie para `tpl-*` nem atualize documentos oficiais.

1. Rode `validateCreation` no rascunho com a collection de conteudo.
2. Rode `validateContentContract` para todos os papeis aprovados.
3. Rode `validateModeBehavior` em cada preview. A entrada inclui
   wrapper, mode, instancia, referencia, raiz de layout e papeis.
4. Rode `validateLayout` em cada preview resolvido por mode.
5. Rode `validateReconstructionContract` em cada rascunho e referencia.
6. Produza screenshots lado a lado: referencia, rascunho sem mode e
   preview de cada cluster. Revise geometria, hierarquia e blocos
   essenciais. Uma validacao matematica aprovada nao dispensa essa
   revisao visual.
7. Entregue ao Validador: IDs dos rascunhos, contratos, previews,
   referencias, collection, modes, scripts e screenshots revisados.

Reprovacao em qualquer item mantem o estado `_rascunho-*`. Corrija ou
reporte a pendencia, mas nao use o nome `tpl-*` para esconder trabalho
incompleto.

## Fase D: promocao apos validacao independente

Use esta fase somente quando o Validador devolveu `APTO PARA PROMOCAO`.
Nao reconstrua tela, mude regra ou altere referencia nesta fase.

1. Leia novamente a evidencia do Validador e rode
   `validatePromotion` com os IDs, collection e resultados de cada
   prova. O script nao substitui o Validador: ele impede que uma
   promocao seja baseada em nome, clone ou carimbo manual.
2. Gere o carimbo final ainda no rascunho, a partir dos `boundVariables` e das component
   properties reais. Complete os campos canonicos de
   `docs/estrutura-lib.md`; nunca copie um carimbo de memoria.
3. Se o carimbo estiver completo, renomeie o componente para a taxonomia final
   `etapa/tpl-nome` ou especializacao funcional aprovada.
4. Mova o template aprovado para `_templates`, remova os previews da
   rodada em `_verificacao-<etapa>`, atualize somente os documentos
   oficiais que ja estavam aprovados e registre a evidencia da
   promocao. Nao crie `Fluxos` nesta fase.

## Fluxos e uma operacao posterior

O prototipo de cada referencia e a fonte do mapa daquela etapa. Por
isso, o Montador nao cria uma segunda linha de telas conectadas durante
a montagem ou validacao.

So monte ou altere a pagina `Fluxos` se o designer pedir explicitamente
uma jornada completa e o mapa selecionar apenas `tpl-*` aprovados. Use
instancias desses templates e conecte etapas distintas. Nunca use
referencia, `_rascunho-*`, preview ou evidencia externa nessa pagina.

## Saida

Primeiro, em linguagem simples, diga o estado do objeto, o que foi
criado ou promovido, o que bateu com cada referencia, o que bloqueia a
proxima acao e o que o designer pode revisar agora. Diga tambem se o
proximo passo e o Validador ou a publicacao manual.

Depois, apresente a evidencia tecnica: IDs, collection, modes,
bindings, scripts, screenshots e documentos alterados.
