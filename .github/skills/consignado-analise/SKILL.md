---
name: consignado-analise
description: Analisa referencias reais por contexto e entrega contrato consolidado para aprovacao humana. Somente leitura.
user-invocable: true
disable-model-invocation: true
---

# Analise de etapa

Leia AGENTS.md, `docs/contrato-papeis.md`, modelo de contextos, manual
global, manual da modalidade, catalogo da etapa, mapa e manual de cada
contexto usado. Na primeira resposta, diga o que vai investigar, peca
somente a lacuna bloqueante e informe a proposta que entregara antes de
qualquer escrita. Sem manual ou regra necessaria, registre [CONFIRMAR]
e pare se a lacuna for bloqueante.

Leia a pagina inteira e somente referencias ref-<modalidade>-<tela>-
<contexto-id>. Antes de concluir qualquer mapa, leia
`scripts/collectPrototypeReactions.js` e
`scripts/collectReferenceStructure.js`; execute os dois em cada Section
`ref-*`, incluindo todos os descendentes. Registre cobertura, contagens,
reacoes, destinos, arvore, Auto Layout, instancias, destacamentos,
bindings e lacunas no manifesto temporario. Falha de varredura, Section
sem cobertura, estrutura ausente ou destino nao exposto impedem proposta
para aprovacao. Varra tambem screenshots e evidencia IDS. Rascunhos nao
contam como evidencia.

Todo contrato de interacao deve nascer da saida do coletor: copie nomes,
origens, destinos e raiz de validacao observados. A raiz escolhida deve
conter a acao declarada. Nome vindo de memoria, de documento ou de plano
nao substitui a evidencia Figma.

Antes de cada `use_figma`, carregue tambem a skill oficial com
`figma-get_figma_skill` em `skill://figma/figma-use/SKILL.md`; a skill
local `figma-plugin-api` nao a substitui. Faca uma chamada por Section.
Para estrutura, comece com `summaryOnly: true`, que preserva cobertura,
telas e sinais relevantes sem devolver a arvore inteira. So peca o
detalhe completo ou um trecho focado quando ele for necessario para uma
conclusao. Se a resposta for salva em arquivo temporario pelo cliente,
leia o trecho exato que sustenta o fato. Nunca complete uma lacuna por
"padrao semelhante": marque a varredura como `FALHOU` e mantenha a
lacuna bloqueante ate recuperar a evidencia.

`boundVariableFields` vazio significa somente "nenhum binding observado
nos campos lidos". Nao escreva "manual", "errado" ou "sem token" sem
comparar o contrato aplicavel. O coletor apresenta sinais tecnicos; a
classificacao pertence ao contrato e ao Validador.

Entregue inventario, reacoes, mapa, contrato de tela, mapa IDS, plano
de variaveis e proposta de composicao. Para confirmacao externa dentro
de Formalizacao, registre presenca e contrato de retorno (`DIRETO` ou
`ACAO_NO_APP`), alem da orientacao direta ou do tutorial opcional, no
mapa e no contrato de jornada. Quando existir tutorial, prove a
bifurcacao e o reencontro no mesmo direcionamento externo. As telas e a cadeia do
ambiente externo sao evidencias de caminho, nao templates internos; sua
quantidade, canais e formato so podem ser registrados como regra local
do contexto. Quando houver componente local,
registre tambem o plano temporario com aprovacao, duas reutilizacoes
previstas e contextos conhecidos. Classifique cada diferenca como
regra de negocio, defeito estrutural, variavel, property, variant,
local-layout ou componente local. O contrato usa IDs logicos; grave em
`.designops/runs/<id>/resolvido.json` somente a resolucao temporaria
desses IDs para os node IDs reais.

Componente local exige duas reutilizacoes previstas no contrato. Toda
proposta separa fato, regra global, regra de convenio e [CONFIRMAR].
Grave somente o manifesto temporario em `.designops/runs/<id>/analise.json`,
a resolucao temporaria em `.designops/runs/<id>/resolvido.json` e o plano
em `.designops/runs/<id>/componentes-locais.json`. Sem componente local,
o plano continua obrigatorio com a lista vazia.
