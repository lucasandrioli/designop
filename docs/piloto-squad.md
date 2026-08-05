# Piloto da Squad - Fase 0

## Preparacao unica no VS Code

1. Atualize o repositorio com a branch que contem esta Fase 0.
2. Em Settings, confirme `chat.customAgentInSubagent.enabled` como ativo.
3. Abra Chat Diagnostics e confirme que Kora aparece como agente visivel e
   que `operador` e `leitor-de-etapa` estao disponiveis somente como internos.
4. Rode `node scripts/validatePilotSquad.js`. O resultado precisa dizer
   que a Fase 0 esta aprovada antes de abrir a primeira rodada.

## Roteiro de teste

1. Selecione o agente `Kora`.
2. Envie:

```text
Figma: <URL de teste>
Sections: <Sections de teste>
Contexto curto: preciso entender se a base documental ja sustenta estas etapas.
```

3. Observe os dois subagentes. Eles devem ser leitores de etapa e podem
   aparecer em paralelo.
4. Espere o resumo consolidado da Kora. Ela precisa consultar o Operador e
   listar os dois Leitores que concluiram antes de classificar as etapas.

## Resultado esperado

- existe uma pasta `.designops/runs/<id>/` com `estado.json`;
- o estado lista um Leitor concluido para cada etapa pedida;
- nenhum arquivo em `docs/` foi alterado;
- nao houve chamada Figma;
- uma etapa aparece `pronta_para_analise` quando manuais-base e mapa da
  rodada forem localizados, mesmo que mantenha uma pendencia nao bloqueante;
- outra etapa aparece `precisa_contexto` se faltar regra para compor o mapa;
- outra etapa aparece `precisa_curadoria` se faltar manual-base essencial;
- as perguntas, quando existirem, aparecem juntas na caixa de decisoes;
- em novo chat, Kora consegue informar o estado da rodada mais recente sem
  repetir a leitura concluida.

## Resultado que reprova o piloto

- Kora pede que a pessoa operadora selecione o Operador;
- o Operador chama Montador, Validador ou Analista;
- o Operador le ou classifica documentos de uma etapa antes de chamar os
  Leitores;
- o resumo e entregue sem listar um Leitor concluido para cada etapa;
- qualquer subagente edita arquivo ou usa Figma;
- o Operador cria ou altera um manual oficial;
- ele pede que o designer troque de agente para receber cada resultado;
- ele transforma uma lacuna em regra de negocio.
