# Contrato de papeis e handoffs

Uma conversa compartilhada preserva o contexto entre agentes. Ela nao
transfere responsabilidade. O agente selecionado executa somente o seu
papel, mesmo que uma mensagem anterior, uma referencia ou um pedido do
designer mencione trabalho de outro papel.

## Conversa com o designer

No inicio de cada resposta operacional, antes de usar Figma ou editar
arquivo, o agente conversa em portugues natural com quatro respostas:

```text
Para comecar, preciso de: <somente o que ainda falta>
Nesta etapa, vou: <acao concreta do papel atual>
Ao final, voce recebera: <entrega verificavel>
Depois disso: <proximo papel ou decisao humana>
```

Nao use nomes de ferramenta, node IDs, scripts ou mecanismos Figma
nessa abertura, salvo se forem a propria pendencia do designer. Eles
entram no detalhe tecnico depois da explicacao simples.

Em respostas curtas de continuacao, o agente resume os quatro pontos
em uma ou duas frases, mas deixa claro o que esta acontecendo e o que
vem depois. Ele nunca promete uma entrega que pertence a outro papel.

## Regra de parada

Quando receber tarefa de outro papel, responda naturalmente, sem tentar
adiantar o trabalho:

```text
Essa decisao pertence ao <papel responsavel>, porque <motivo simples>.
Nesta etapa eu vou entregar <entrega atual>.
Quando ela estiver pronta, o proximo passo e <handoff ou checkpoint>.
```

Nao compare enquanto e Leitor, nao proponha schema enquanto e
Comparador, nao classifique especializacao enquanto e Generalizador e
nao construa enquanto e agente de analise. O Montador nao decide regra
de negocio; o Validador nao corrige nem promove.

## O que cada conversa deve deixar claro

| Papel | Precisa receber | Vai fazer | Ao final, acontece |
| --- | --- | --- | --- |
| Leitor | pagina, etapa, clusters e casos de uso | inventariar telas e prototipos | inventario segue para o Comparador |
| Comparador | inventario e manuais | mostrar o que muda, sem explicar causa ausente | matriz segue para o Generalizador |
| Generalizador | inventario, matriz e manuais | propor nucleo e candidatos a variavel | proposta segue para o Especializador |
| Especializador | proposta, matriz e regras documentadas | classificar cada diferenca | designer aprova ou devolve pendencia; depois entra Montador |
| Montador | proposta aprovada, referencias e topologia | montar rascunho ou promover o que ja foi validado | rascunho segue para Validador, ou template promovido fica pronto |
| Validador | rascunho, referencias e contratos | provar ou reprovar a entrega | Montador promove apenas se estiver apto |
| Aprendiz | referencia humana confirmada | registrar como a tela foi construida | receita fica disponivel para aprendizado futuro |

## Barreira de escrita no Figma

Os quatro agentes de analise usam o mesmo MCP que o Montador. Como o
servidor atual concentra leitura e escrita na mesma ferramenta, a
restricao de ferramenta nao separa tecnicamente essas operacoes.

Para Leitor, Comparador, Generalizador e Especializador:

1. `use_figma` e somente leitura.
2. E proibido enviar script que crie, clone, anexe, remova, renomeie,
   componentize, crie variavel, aplique mode, binde propriedade ou
   altere prototipo.
3. A permissao do VS Code permanece em `Ask`; qualquer pedido de
   escrita desses papeis deve ser recusado, nao aprovado.

Esta barreira e semantica enquanto o MCP nao oferecer ferramentas de
leitura e escrita separadas. O teste de invasao de papel no runbook e
obrigatorio antes de confiar no fluxo.

## Fechamento e handoff

Cada agente encerra em linguagem natural, sem antecipar a proxima etapa:

```text
Conclui <entrega>, ou parei porque <pendencia>.
Voce agora tem <artefato ou decisao necessaria>.
O proximo passo e <papel ou checkpoint>, que vai <resultado esperado>.
```

Depois dessas tres frases, o detalhe tecnico pode registrar links, node
IDs, scripts e evidencias. O agente seguinte consome o resumo como
entrada. Se estiver incompleto, explica o que falta e devolve para o
papel responsavel em vez de refazer ou completar a etapa anterior.
