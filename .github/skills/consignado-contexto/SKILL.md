---
name: consignado-contexto
description: Usa a base documental para capturar lacunas de uma rodada e propor mapa ou curadoria aprovada, sem reescrever manuais-base.
user-invocable: true
disable-model-invocation: true
---

# Captura de contexto

Use antes da analise quando a rodada encontrar lacuna, conflito ou mapa
ausente. Leia `docs/contrato-papeis.md`, `docs/base-documental.md`, o
manual global, modalidade, etapa e os manuais de contexto aplicaveis.
Na primeira resposta, diga o que vai investigar, pergunte somente a
primeira lacuna bloqueante e informe qual texto entregara ao fim do turno.
Tela e prototipo revelam fluxo, nunca a origem de uma regra.

Manuais-base pertencem ao `master` e sao atualizados somente por
`/consignado-base` em uma worktree de curadoria aprovada. Nesta skill,
regra documentada nao e perguntada de novo. Regra ausente ou divergente
permanece `[CONFIRMAR]` e gera proposta de curadoria, nunca edicao direta
de manual, catalogo ou indice da base.

## Contexto guiado com referencias Figma

Quando o pedido incluir leitura Figma, carregue localmente
`consignado-contexto`, `consignado-analise` e `figma-plugin-api`.
Carregue `figma-reconstrucao` somente se tambem precisar resolver IDS,
arvore-alvo ou fontes de composicao. Antes de cada `use_figma`, inclusive
uma chamada subsequente somente de leitura, carregue a skill oficial
`skill://figma/figma-use/SKILL.md`. Uma coleta continua atomica: um
coletor, uma Section e uma parte por chamada; nao use lotes nem wrappers.

Para localizar documentos, leia os caminhos canonicos do recorte um a um:
manual global, modalidade, etapa, cada `docs/contextos/<contexto-id>.md`
informado ou descoberto nas referencias e o mapa se ele ja existir. Nao
liste diretorios inteiros. Nao liste diretorios inteiros por padrao.
Manual-base ausente e falha da base, nao
autorizacao para inferir regra nem para recriar o arquivo nesta rodada.

Quando a pagina Figma real ja tiver biblioteca, componentes locais,
templates ou variaveis, registre o recorte de referencias em
`.designops/runs/<rodada>/referencias.json` antes de qualquer coleta.
Leia somente as Sections `ref-*` selecionadas. O restante da pagina e
ignorado nesta rodada e ativo existente dentro do recorte continua sendo
somente evidencia, nao material aprovado para reutilizacao.

Classifique cada frase do rascunho como `FATO OBSERVADO`, `REGRA
DOCUMENTADA`, `REGRA CONFIRMADA` ou `[CONFIRMAR]`. Estrutura, reacao,
sequencia, timeout e tela existente no Figma sao somente `FATO
OBSERVADO`. Nunca escreva "regra global" ou "regra local" sem fonte
documental ou confirmacao humana identificada. Em particular, retorno
`DIRETO` ou `ACAO_NO_APP`, presenca obrigatoria de confirmacao externa e
tutorial opcional ficam `[CONFIRMAR]` ate essa fonte existir.

Antes de mostrar qualquer rascunho para aprovacao, grave somente
`.designops/runs/<rodada>/contexto.json` conforme
`docs/contratos/contexto-rodada.schema.json`. Cada afirmacao precisa ter
escopo, classificacao, fonte e, quando for Figma, Section de evidencia.
Leia `scripts/validateContextDraftCore.js`, releia o arquivo recem-gravado
e rode o core com o objeto em `use_figma` somente de leitura, depois de
carregar a skill oficial. So apresente o rascunho quando o retorno literal
for `passed: true`. O status `APROVADO_PARA_REGISTRO` exige a aprovacao
humana registrada e nenhuma lacuna `[CONFIRMAR]` bloqueante. O adaptador
Node e opcional e nao participa da operacao no banco.

Antes de perguntar, recupere manual global, manual da modalidade,
catalogo da etapa, manuais de contexto e mapa existente. Descubra o que
puder nas referencias e pergunte apenas a regra ausente, conflituosa ou
necessaria para compor o mapa. Quando houver confirmacao externa dentro de Formalizacao,
pergunte se ela esta presente e qual e o contrato de retorno ao app:
`DIRETO` ou `ACAO_NO_APP`. Pergunte tambem se a orientacao oferece
tutorial opcional, que deve reencontrar o mesmo direcionamento externo
do caminho direto. Nao pergunte quantidade de acoes externas
para decidir a arquitetura: quantidade, canais e formato sao regra local
do contexto. Mostre em conversa o rascunho do mapa e, quando aplicavel,
a proposta de atualizacao da base.

Espere aprovacao humana explicita do texto. So entao crie ou atualize
`docs/mapas/<modalidade>.md` na worktree da rodada. Quando houver regra
nova aprovada, registre a proposta em `.designops/runs/<rodada>/` e
encaminhe para `/consignado-base`; nao altere manual global, modalidade,
etapa, contexto ou indice da base. O que nao tiver origem aprovada recebe
`[CONFIRMAR]`.
