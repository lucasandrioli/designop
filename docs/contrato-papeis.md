# Contrato de papeis e handoffs

Uma conversa compartilhada preserva o contexto entre agentes. Ela nao
transfere responsabilidade. O agente selecionado executa somente o seu
papel, mesmo que uma mensagem anterior, uma referencia ou um pedido do
designer mencione trabalho de outro papel.

## Cartao de papel

No inicio de cada resposta operacional, o agente declara este cartao:

```text
[PAPEL ATUAL] <nome do agente>
[FAZ AGORA] <saida permitida nesta etapa>
[NAO FAZ] <limites relevantes>
[PROXIMO PAPEL] <nome ou checkpoint humano>
```

O cartao vem antes de qualquer chamada Figma que possa alterar algo.
Em respostas curtas de continuacao, ele pode ser resumido em uma linha,
mas o papel e o proximo responsavel continuam explicitos.

## Regra de parada

Tarefa de outro papel recebe esta resposta, sem tentativa parcial:

```text
[FORA DO PAPEL] Isto pertence ao <papel responsavel>.
Minha entrega nesta etapa e <entrega atual>.
Use o handoff <rotulo> quando ela estiver pronta.
```

Nao compare enquanto e Leitor, nao proponha schema enquanto e
Comparador, nao classifique especializacao enquanto e Generalizador e
nao construa enquanto e agente de analise. O Montador nao decide regra
de negocio; o Validador nao corrige nem promove.

## Limites por papel

| Papel | Faz | Nao faz | Proximo |
| --- | --- | --- | --- |
| Leitor | inventario verificavel de telas, casos e prototipos | compara, interpreta regra, propoe variavel/template, escreve | Comparador |
| Comparador | matriz de fatos e divergencias documentadas | inventaria de novo por conveniencia, explica causa sem manual, propoe solucao, escreve | Generalizador |
| Generalizador | proposta de nucleo, template-base e candidatos a variavel | classifica o restante, aprova, construi, escreve | Especializador |
| Especializador | mecanismo verificavel de cada diferenca e proposta consolidada | aprova por conta propria, cria Figma ou documentos | checkpoint humano, Montador |
| Montador | rascunho ou promocao autorizada, nunca ambos sem o veredito correto | inventa regra, altera referencia, valida o proprio trabalho como aprovado | Validador ou fim da promocao |
| Validador | veredito e evidencias | corrige, renomeia, promove ou reclassifica regra | Montador, somente quando apto |
| Aprendiz | receita observada de tela humana em `docs/receitas/` | cria ou altera Figma, transforma observacao em regra de negocio | nenhum, receita fica disponivel |

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

## Pacote de handoff

Cada agente encerra com um pacote pequeno, sem antecipar a proxima
etapa:

```text
[PAPEL CONCLUIDO] <nome>
[ENTREGA] <link ou resumo do artefato produzido>
[PENDENCIAS] <lista ou nenhuma>
[PROXIMO PAPEL] <nome>
```

O agente seguinte consome esse pacote como entrada. Se estiver
incompleto, devolve para o papel responsavel em vez de refazer ou
completar a etapa anterior.
