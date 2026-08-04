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
de contexto depois de explicacao e aprovacao humana.

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
| L-011 | Dados que mudam por proposta sao transacionais e nao viram valor fixo de mode. | GENERICO | modelo de contextos | CONSOLIDADO | consignado-analise, validateContentContract |
| L-012 | Contexto preserva cada passo interno observado; reuso e template so sao decididos na analise posterior. | GENERICO | regra de evidencia | CONSOLIDADO | consignado-contexto, mapa de fluxo |
| L-013 | Diferenca entre convenios recebe regra do designer ou `[CONFIRMAR]`; evidencia externa e handoff, nao tela da biblioteca. | GENERICO | regra de negocio e topologia | CONSOLIDADO | consignado-contexto, contrato de papeis |
| L-014 | Descoberta IDS parte de instancias nas referencias; cada fonte confirmada restringe buscas pela sua library key, sem varrer catalogos disponiveis. | GENERICO | uso MCP e eficiencia de contexto | CONSOLIDADO | consignado-analise, figma-reconstrucao, runbook-banco |
| L-015 | TeamLibrary enumera somente variables. Componentes exigem instancia observada ou busca MCP restrita a biblioteca conectada, seguida de importacao de preflight pela key e assetType reais. | GENERICO | Plugin API e MCP | CONSOLIDADO | figma-plugin-api, figma-referencias, runbook-banco |
| L-016 | Instancias sao opacas para composicao: o agente usa properties publicas ou coloca conteudo adicional como irmao em frame local. | GENERICO | Plugin API | CONSOLIDADO | figma-plugin-api, figma-referencias, runbook-banco |
| L-017 | Definitions de component property pertencem ao COMPONENT_SET quando o componente e variante; validadores devem ler o set pai ou properties da instancia. | GENERICO | Plugin API | CONSOLIDADO | figma-plugin-api, validadores de conteudo e jornada |
| L-018 | Rodape fixo em frame rolavel e representado pelos ultimos filhos e por numberOfFixedChildren na raiz; nao existe boolean por filho. | GENERICO | Plugin API | CONSOLIDADO | figma-plugin-api, figma-reconstrucao, validateReconstructionContract |
| L-019 | Papel IDS so e valido quando a instancia resolve para componente remoto; key sem libraryKey de origem nao e evidencia suficiente em arquivo com varias bibliotecas. | GENERICO | Plugin API e contrato de composicao | CONSOLIDADO | inspectRemoteComponent, validateCompositionContract, skills Figma |
| L-020 | Componentes locais ficam em uma Section interna. A verificacao de sobreposicao precisa procurar componentes dentro de `_componentes-locais`, nao apenas componentes soltos na pagina. | GENERICO | organizacao de canvas | CONSOLIDADO | validateCanvasOrganization, testNeutralGuardrails |
| L-021 | Antes de diagnosticar permissao, confira a `fileKey` completa contra a URL registrada da rodada. Uma chave incorreta pode devolver mensagem de acesso, embora o problema seja apenas o alvo da chamada. | GENERICO | chamada MCP com chave incorreta e repeticao com chave registrada | CONSOLIDADO | figma-plugin-api, runbook-banco |
| L-022 | O contrato de interacao usa nomes, destinos e raiz extraidos pelo coletor de reacoes. Nomes transcritos de memoria ou raiz que nao contem a acao devem reprovar e ser corrigidos pela evidencia. | GENERICO | validateInteractionContract no laboratorio MCP | CONSOLIDADO | consignado-analise, figma-referencias |

## Registro futuro

| ID | Aprendizado | Classe | Evidencia minima | Estado | Aplicado em |
| --- | --- | --- | --- | --- | --- |
| H-<id> | <achado ainda nao generalizavel> | HIPOTESE | <evidencia do worktree local> | PENDENTE | worktree local |

Antes de promover um item `HIPOTESE`, atualize sua classe, evidencia,
estado e destino. O script `validateLearningsLedger.js` impede que uma
hipotese seja declarada aplicada ao motor.
