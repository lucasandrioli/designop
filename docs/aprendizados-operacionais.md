# Aprendizados operacionais

Este documento preserva o que a operacao aprendeu sem transformar um
cenario isolado em regra da biblioteca.

## Classes e promocao

- `GENERICO`: vale para qualquer etapa do consignado. Exige fonte tecnica,
  decisao de produto para toda a biblioteca ou repeticao em duas etapas
  independentes.
- `ETAPA`: vale somente para uma etapa e fica no catalogo ou no mapa dela.
- `HIPOTESE`: foi observada uma vez ou ainda nao tem evidencia suficiente.
  Nunca entra em agente, skill ou script operacional.

Uma diferenca visual nunca vira regra de negocio. Ela so entra em manual
de cluster depois de explicacao e aprovacao humana.

## Registro

| ID | Aprendizado | Classe | Evidencia minima | Estado | Aplicado em |
| --- | --- | --- | --- | --- | --- |
| L-001 | Inventariar todas as secoes `ref-*` antes de concluir a leitura. | GENERICO | leitura completa da pagina | CONSOLIDADO | consignado-contexto, consignado-analise |
| L-002 | Leitura truncada exige recuperar o artefato indicado ou encerrar como nao verificavel. | GENERICO | comportamento da ferramenta | CONSOLIDADO | analista, runbook |
| L-003 | Reacoes sao lidas por varredura programatica da raiz e dos descendentes de cada secao `ref-*`, com origem, gatilho, destino, fonte e cobertura registrada. | GENERICO | Plugin API e referencias | CONSOLIDADO | collectPrototypeReactions, consignado-analise, validateAnalysisManifest |
| L-004 | Ordem visual dos frames nao prova navegacao. | GENERICO | regra de evidencia | CONSOLIDADO | consignado-contexto, consignado-analise |
| L-005 | `get_design_context` revela fatos tecnicos; ele nao cria regra de negocio. | GENERICO | contrato de papeis | CONSOLIDADO | consignado-analise |
| L-006 | Biblioteca conectada nao prova escolha IDS. `EXATO` exige key, property ou variant e evidencia. | GENERICO | Plugin API e contrato IDS | CONSOLIDADO | consignado-analise, consignado-validacao |
| L-007 | Asset proprietario ausente bloqueia a tela, sem placeholder ou aproximacao. | GENERICO | regra de montagem | CONSOLIDADO | consignado-analise, consignado-montagem |
| L-008 | Referencia crua define resultado visivel e comportamento, nao a arvore interna. | GENERICO | contrato de reconstrucao | CONSOLIDADO | figma-reconstrucao, validateReconstructionContract |
| L-009 | Contrato geometrico usa medida exata, `HUG` ou `NAO_MEDIDO`, nunca aproximacao. | GENERICO | regra de validacao | CONSOLIDADO | consignado-analise, consignado-validacao |
| L-010 | Analista le referencias; Montador escreve rascunhos; Validador audita; `Fluxos` e posterior. | GENERICO | contrato de papeis | CONSOLIDADO | AGENTS, agentes |
| L-011 | Dados que mudam por proposta sao transacionais e nao viram valor fixo de mode. | GENERICO | modelo de clusters | CONSOLIDADO | consignado-analise, validateContentContract |
| L-012 | Contexto preserva cada passo interno observado; reuso e template so sao decididos na analise posterior. | GENERICO | regra de evidencia | CONSOLIDADO | consignado-contexto, mapa de fluxo |
| L-013 | Diferenca entre convenios recebe regra do designer ou `[CONFIRMAR]`; evidencia externa e handoff, nao tela da biblioteca. | GENERICO | regra de negocio e topologia | CONSOLIDADO | consignado-contexto, contrato de papeis |

## Registro futuro

| ID | Aprendizado | Classe | Evidencia minima | Estado | Aplicado em |
| --- | --- | --- | --- | --- | --- |
| H-<id> | <achado ainda nao generalizavel> | HIPOTESE | <evidencia do worktree local> | PENDENTE | worktree local |

Antes de promover um item `HIPOTESE`, atualize sua classe, evidencia,
estado e destino. O script `validateLearningsLedger.js` impede que uma
hipotese seja declarada aplicada ao motor.
