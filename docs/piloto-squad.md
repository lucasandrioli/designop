# Piloto da Squad - Fase 0

## Preparacao unica no VS Code

1. Atualize o repositorio com a branch que contem esta Fase 0.
2. Em Settings, confirme `chat.customAgentInSubagent.enabled` como ativo.
3. Abra Chat Diagnostics e confirme que aparecem `operador` e
   `leitor-de-etapa` sem erro.
4. Rode `node scripts/validatePilotSquad.js`. O resultado precisa dizer
   que a Fase 0 esta aprovada antes de abrir a primeira rodada.

## Roteiro de teste

1. Selecione o agente `operador`.
2. Envie:

```text
Inicie uma rodada de leitura para as etapas Anuencia e Simulacao.
Nao altere Figma nem documentos oficiais. Quero apenas saber o que ja
esta pronto e o que precisa de contexto.
```

3. Observe os dois subagentes. Eles devem ser leitores de etapa e podem
   aparecer em paralelo.
4. Espere o resumo consolidado do Operador.

## Resultado esperado

- existe uma pasta `.designops/runs/<id>/` com `estado.json`;
- nenhum arquivo em `docs/` foi alterado;
- nao houve chamada Figma;
- Anuencia aparece `pronta_para_analise` quando catalogo, mapa e manuais
  forem localizados, mesmo que mantenha uma pendencia nao bloqueante;
- Simulacao aparece `precisa_contexto` se ainda nao houver documentos;
- as perguntas, quando existirem, aparecem juntas na caixa de decisoes;
- em novo chat, o Operador consegue informar o estado da rodada mais
  recente sem repetir a leitura concluida.

## Resultado que reprova o piloto

- o Operador chama Montador, Validador ou Analista;
- qualquer subagente edita arquivo ou usa Figma;
- o Operador cria ou altera um manual oficial;
- ele pede que o designer troque de agente para receber cada resultado;
- ele transforma uma lacuna em regra de negocio.
