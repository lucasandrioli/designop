# Comece aqui: seus primeiros dias no Itaú

Ordem exata. Nao pule etapas: cada uma protege a seguinte.

> **Antes de rodar qualquer agente, leia `docs/instalacao.md`.** Ele
> lista o que precisa EXISTIR (ambiente, conhecimento, artefato Figma)
> para os agentes conseguirem operar, e define o conjunto minimo viavel
> para fechar o primeiro ciclo: 1 etapa + 2 clusters. A checagem inicial
> do comparador cobra esses pre-requisitos e recusa comecar sem eles.
>
> [PENDENTE] Este documento (COMECE-AQUI) ainda descreve a invocacao
> antiga dos agentes (`@comparador`) e nao menciona intake, modalidade
> nem o formato de checkpoint. A invocacao atual e por slash command:
> `/comparador`, `/montador`, `/validador`. Atualizacao completa
> pendente.

---

## DIA 1 (manha): instalar e conectar. ~1h

1. Baixar este repo (do seu GitHub) e abrir a pasta no VS Code.
2. Conectar o Figma:
   Cmd/Ctrl+Shift+P > "MCP: Add Server" > HTTP >
   URL: https://mcp.figma.com/mcp > id: figma
3. Autenticar com a conta Figma do Itau quando abrir o navegador.
4. Conferir no chat do Copilot:
   - digite /skills : devem aparecer as skills deste repo
   - o seletor de agente deve mostrar: comparador, montador,
     validador
5. Teste de vida: peca ao Copilot "liste as bibliotecas conectadas
   neste arquivo Figma" passando o link de um arquivo do consignado.
   Se responder, esta conectado.

Se travar aqui: seat do Figma precisa ser Dev ou Full. View/Collab
tem limite de 6 chamadas por MES (inviavel). Resolva isso antes.

---

## DIA 1 (tarde): bateria de fumaca. ~3h

NAO construa nada ainda. Rode docs/runbook-banco.md, os 10 itens, num
arquivo Figma descartavel. E o que prova que o ambiente do banco se
comporta como o laboratorio.

O item 5 (binding em componente complexo do IDS) e o critico:
- Se PASSAR: siga em frente com confianca.
- Se FALHAR: pare. O desenho do binding muda e precisamos conversar
  antes de construir qualquer coisa.

Anote PASSOU/FALHOU de cada item. Isso vira o anexo tecnico da sua
proposta interna.

---

## DIA 2: preparar o terreno. ~meio periodo

1. Criar o arquivo novo e limpo: "Consignado OP — Lib" (vazio).
2. Adicionar nele as 4 bibliotecas do IDS (Assets > Libraries).
3. Criar as paginas: Referencias, Fluxos, e uma por etapa
   (Consentimento, Simular e contratar, Revisar, Formalizar).
4. Definir o escopo do piloto: 2 clusters (ex: MG e Federais),
   1 modalidade (primeira concessao), caso feliz.

---

## DIA 3+: o ciclo de trabalho (e aqui que voce vira o motor)

### VOCE FAZ (o que a IA nao faz bem):
1. Construir as telas cruas do fluxo feliz do cluster A, na pagina
   Referencias. Instanciando componentes do IDS. Sem variaveis, sem
   componentizar. So a tela, como ela e hoje.
2. Construir as MESMAS telas do cluster B, ao lado.
3. Linkar as duas com prototipo (o link do "Continuar" etc) e nomear
   o starting point ("Caso feliz").

Dica: nao se preocupe com nomenclatura. Voce declara ao agente "estas
telas sao da etapa X" e ele normaliza.

### O AGENTE FAZ (o repetitivo):
4. `@comparador` : "compare as referencias dos dois clusters na etapa
   simular-e-contratar". Ele devolve: o que muda entre clusters, a
   proposta de variaveis e o mapa do fluxo.
5. VOCE REVISA a proposta (nomes das variaveis, o que virou o que).
   Corrija o que estiver errado. Este e o momento de decisao humana.
6. `@montador` : "componentize e binde conforme o schema
   aprovado". Ele cria as variaveis, componentiza a tela, conecta tudo
   e carimba a descricao.
7. `@validador` : "valide". Ele confere layout quebrado, texto cortado,
   conexoes faltando, consistencia com o mapa, em TODOS os clusters.

### DEPOIS (a manutencao, onde o investimento se paga):
- Mudou um texto num cluster? Edite a celula na tabela de variaveis do
  Figma. So isso.
- Entrou cluster novo? Adicione o mode, rode o comparador no material
  novo, preencha os valores.
- O IDS mudou? Rode `@validador` : ele varre o impacto em tudo.

---

## O que NAO fazer

- Nao peca ao agente para criar telas do zero (ainda). Ele nao sabe
  como voce constroi. Isso e o Bloco 3 (docs/receitas/).
- Nao construa a lib inteira de uma vez. Uma etapa por vez, validando.
- Nao pule a bateria de fumaca. Serio.
