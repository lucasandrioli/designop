# Mapa de jornada: <modalidade>

## Metadados

- Modalidade: <modalidade>
- Manual global: <caminho e secao>
- Manual da modalidade: docs/modalidades/<modalidade>.md
- Contextos usados: <contexto-ids>
- Aprovado por: <nome ou CONFIRMAR>
- Atualizado em: <data>

## Selecoes

| Etapa | Tela | Caso de uso | Presenca por contexto | Reacao/caminho | Template selecionado | Mecanismo da diferenca | Origem da regra |
| --- | --- | --- | --- | --- | --- | --- | --- |
| <etapa> | <tela> | <caso> | <contexto-id>: presente|ausente | <origem -> destino> | <modalidade>/<etapa>/tpl-<tela> | <variavel|property|variant|local-layout|especializacao> | <global|convenio|[CONFIRMAR]> |

## Composicoes internas

| Composicao | Etapa hospedeira | Presenca por contexto | Roteiro de orientacao | Contrato de retorno | Caminho | Origem da regra |
| --- | --- | --- | --- | --- | --- |
| <confirmacao-externa> | <etapa> | <contexto-id>: presente|ausente | <DIRETA|DIRETA_COM_TUTORIAL_OPCIONAL|[CONFIRMAR]> | <DIRETO|ACAO_NO_APP|[CONFIRMAR]> | <origem -> retorno ao app> | <global|convenio|[CONFIRMAR]> |

O mapa registra presenca e retorno. Quantidade, canais e formato das
acoes externas ficam no manual de contexto e nas evidencias, sem virar
uma sequencia de templates internos. Quando existir tutorial, o mapa
registra uma rota opcional que reencontra o mesmo direcionamento externo
do caminho direto.

## Contextos

| Contexto-id | Manual | Rotulo atual consultado | Evidencia |
| --- | --- | --- | --- |
| <contexto-id> | docs/contextos/<contexto-id>.md | <rotulo> | <referencia ou documento> |

## Lacunas

| Item | Impacto | Acao |
| --- | --- | --- |
| <item> | <bloqueante|nao bloqueante> | [CONFIRMAR] |
