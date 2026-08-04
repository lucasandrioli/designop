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

Faca uma chamada por Section para evitar truncamento. Se a resposta for
salva em arquivo temporario pelo cliente, leia o arquivo por trechos ou
pesquise os pontos necessarios antes de seguir. Nunca conclua que uma
reacao nao existe porque a resposta ficou grande; marque a varredura
como `FALHOU` e mantenha a lacuna bloqueante ate recuperar a evidencia.

Entregue inventario, reacoes, mapa, contrato de tela, mapa IDS, plano
de variaveis e proposta de composicao. Quando houver componente local,
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
