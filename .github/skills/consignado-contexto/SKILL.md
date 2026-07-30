---
name: consignado-contexto
description: Conduz a conversa inicial de uma etapa, transforma apenas afirmacoes aprovadas do designer em catalogo, manuais de convenio e mapa de fluxo, sem inferir regra pelas telas. Use antes de consignado-analise quando os documentos ainda nao existirem.
user-invocable: true
disable-model-invocation: true
---

# Contexto guiado da etapa

Use esta skill quando o designer tiver referencias no Figma, mas ainda
nao tiver os documentos minimos da etapa e dos convenios. Ela reduz o
trabalho de preparar manuais sem relaxar a regra de que documentos
aprovados sao a verdade de negocio.

Esta nao e uma analise de template. Nao propoe variavel, property,
variant, especializacao, arvore-alvo, componente IDS ou montagem.

Nao use esta skill apenas porque a conversa e nova. Primeiro procure o
catalogo, o mapa e os manuais da etapa citada. Se eles existirem, a
rodada deve recuperar esse contexto e seguir no papel pedido. Contexto
guiado e somente a porta para uma etapa ainda nao documentada.

## Limites do modo

- Figma e somente leitura.
- Prototipo e tela mostram fatos, nunca a razao de negocio.
- O designer pode explicar em linguagem comum. Nao peca lista de textos,
  propriedades, componentes ou node IDs.
- O Analista devolve o rascunho primeiro na conversa. Sem aprovacao
  explicita, nao edita arquivo algum.
- Depois da aprovacao, pode escrever somente catalogo de etapa, manuais
  de cluster e mapa de fluxo. Nao cria, edita ou renomeia nada no Figma.
- Ao terminar o registro, encerra esta rodada. A analise comeca depois,
  em `/consignado-analise`.

## Como abrir a conversa

Comece como uma conversa de trabalho. Use o que o designer ja forneceu,
inclusive link e nomes de clusters. Diga que voce vai percorrer as
referencias e que ele nao precisa descrever tela por tela.

Peca somente a primeira informacao que a referencia nao pode revelar.
Normalmente sera o nome e limite da etapa, a modalidade do caminho ou a
regra que explica uma diferenca importante entre convenios. Uma boa
abertura e:

```text
Oi, vamos registrar o contexto da etapa. Eu vou olhar as referencias e
os prototipos para entender o caminho; voce nao precisa me explicar a
interface. Para comecar, me conte em poucas palavras o que esta etapa
resolve para a pessoa e em qual momento da jornada ela comeca e termina.
Depois eu te devolvo um rascunho curto dos manuais para voce aprovar.
```

Se o contexto ja estiver na conversa, nao repita a pergunta. Diga o que
entendeu e faca somente a proxima pergunta necessaria.

## Sequencia

### 1. Ler o que o Figma prova

Inventarie, sem interpretar regra:

- secoes `_ref-<cluster>`;
- telas por caso de uso;
- conexoes do prototipo, incluindo idas a canais externos e retornos;
- telas que parecem fronteira com outra etapa;
- diferencas factuais entre os clusters.

Rotule esse material como `Fato observado no Figma`.

### 2. Capturar o que so o designer sabe

Conduza uma pergunta de cada vez. Prioridade:

1. etapa, objetivo, inicio e fim;
2. modalidade e caso de uso do fluxo;
3. quais clusters participam;
4. regra que explica cada diferenca relevante;
5. origem conhecida da regra, quando houver.

Quando o designer nao souber, use `[CONFIRMAR]`. Nao complete com uma
suposicao baseada no nome de tela, no texto ou no numero de passos.

### 3. Mostrar rascunho para aprovacao

Antes de escrever, entregue um rascunho simples, em duas partes.

Primeiro, use linguagem de negocio:

```text
Entendi assim:

- Etapa: <nome e objetivo>.
- Limite: <onde comeca e termina>.
- Modalidade: <valor ou [CONFIRMAR]>.
- <cluster A>: <regra dita pelo designer>.
- <cluster B>: <regra dita pelo designer>.
```

Depois, liste apenas os fatos relevantes que vieram do Figma e as
lacunas `[CONFIRMAR]`. Termine perguntando se o texto representa o que o
designer quis dizer. Nao mostre mecanismo tecnico nesta fase.

### 4. Registrar somente apos aprovacao

Aprovacao precisa ser clara, por exemplo:

```text
APROVO o contexto e o texto dos manuais da etapa <etapa>.
```

Depois dela, crie ou atualize:

1. `docs/etapas/<etapa>.md`, com objetivo, limite e regras
   compartilhadas que o designer aprovou;
2. `docs/clusters/<cluster>.md`, com modalidades ativas, presenca da
   etapa e regras locais aprovadas. Nao transcreva interface;
3. `docs/mapa-fluxo-<escopo>.md`, com os caminhos e presencas que o
   prototipo mostrou, apontando regras pelo identificador do manual.

Regra aprovada pelo designer recebe origem informada por ele. Se a
origem nao foi dada, escreva `Origem: [CONFIRMAR]`, nao invente uma.
Fato de prototipo pode registrar a fonte como `referencia Figma`, mas
nunca como origem de negocio.

## Fechamento

Explique, sem jargao, quais documentos foram registrados e que eles
agora sao a fonte oficial para a proxima rodada. Indique que o proximo
comando e `/consignado-analise`, que vai comparar as referencias sem
pedir novamente as regras ja documentadas.
