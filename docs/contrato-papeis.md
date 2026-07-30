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

O Analista executa inventario, comparacao, generalizacao e
especializacao na sequencia definida, mas nao constroi. O Montador nao
decide regra de negocio; o Validador nao corrige nem promove.

## O que cada conversa deve deixar claro

| Papel | Precisa receber | Vai fazer | Ao final, acontece |
| --- | --- | --- | --- |
| Analista da Etapa | pagina, documentos, clusters e casos | inventariar, comparar e propor arvore-alvo, IDS, variaveis e excecoes | designer aprova ou devolve pendencias; depois entra Montador |
| Montador | proposta e contrato aprovados, referencias e topologia | construir arvore-alvo em `_verificacao-<etapa>` ou promover para `_templates` | rascunho segue para Validador, ou template promovido fica pronto e a verificacao e limpa |
| Validador | rascunho, referencias e contrato tecnico | provar ou reprovar arvore, geometria, IDS, conteudo, modes e layout | Montador promove apenas se estiver apto |
| Aprendiz, funcao do Analista | referencia humana confirmada | registrar como a tela foi construida | receita fica disponivel para aprendizado futuro |

## Barreira de escrita no Figma

Os quatro agentes de analise usam o mesmo MCP que o Montador. Como o
servidor atual concentra leitura e escrita na mesma ferramenta, a
restricao de ferramenta nao separa tecnicamente essas operacoes.

Para o Analista da Etapa:

1. `use_figma` e somente leitura.
2. E proibido enviar script que crie, clone, anexe, remova, renomeie,
   componentize, crie variavel, aplique mode, binde propriedade ou
   altere prototipo.
3. A permissao do VS Code permanece em `Ask`; qualquer pedido de
   escrita Figma deve ser recusado, nao aprovado.

O comando `/consignado-aprendizado` continua sem escrita Figma. Ele pode
editar somente `docs/receitas/` depois de confirmar referencia humana.

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
