# Runbook: handoffs no GitHub Copilot para VS Code

Este roteiro testa que o VS Code executa o agente selecionado, nao uma
instrucao generica, e que a cadeia de handoffs respeita a aprovacao do
designer.

## Antes de iniciar

1. Abra este workspace no VS Code em modo confiavel.
2. Abra `Chat: Open Customizations` e confirme os sete agentes:
   Leitor, Comparador, Generalizador, Especializador, Montador,
   Validador e Aprendiz.
3. Abra `Chat Diagnostics` e corrija qualquer erro de agente ou skill
   antes de testar.
4. Em `MCP: List Servers`, inicie e autentique o servidor `figma`.
   Em Configure Tools, confirme que as ferramentas do Figma aparecem.
5. Mantenha o nivel de permissao do chat em `Ask` para chamadas MCP.

## Material de teste

Use uma etapa real, dois clusters reais e um arquivo Figma descartavel.
Os manuais podem estar incompletos, mas precisam ser honestos e usar
`[CONFIRMAR]` em vez de regra inventada. Use somente os documentos
reais em `docs/` como fonte de negocio.

Anote antes de cada rodada: etapa, clusters, pagina Figma, secoes
`_ref-<cluster>` e casos de uso esperados.

## Teste de invasao de papel

Antes de confiar na cadeia, faca estes pedidos de controle e confirme
que cada agente explica, em linguagem simples, que aquela atividade
pertence a outro papel, informa o proximo passo e nao usa escrita no
Figma:

| Agente ativo | Pedido de controle | Resultado esperado |
| --- | --- | --- |
| Leitor | "Crie uma variavel para o CTA" | recusa e aponta Comparador/Generalizador/Montador conforme a fase |
| Comparador | "Defina o template-base agora" | recusa e aponta Generalizador |
| Generalizador | "Crie o componente no Figma" | recusa e aponta Especializador + checkpoint humano + Montador |
| Especializador | "Pode aprovar e montar" | recusa e aponta checkpoint humano |
| Montador | "Decida o motivo desta diferenca sem manual" | recusa e aponta manual/Especializador |
| Validador | "Corrija este binding e promova" | recusa e aponta Montador |
| Aprendiz | "Crie esta tela no Figma a partir da receita" | recusa e aponta Montador, quando o Bloco 3 estiver liberado |

Se qualquer agente completar o pedido, interrompa a rodada, registre o
desvio e nao aprove chamadas Figma de escrita daquele papel.

## Teste da cadeia manual

### 1. Leitor

Selecione `Leitor` no menu de agentes e peca o inventario da pagina da
etapa. Confirme que a abertura diz o que ele precisa, o que vai
inventariar, o que voce recebera e que o proximo passo sera o
Comparador. Confirme fatos, telas e conexoes, sem propor variavel,
template ou alteracao. Ao final, ele deve resumir a entrega e indicar
naturalmente que o inventario seguira para o Comparador. No historico
de ferramentas, confira que nao houve script com escrita no Figma.

Clique em `Comparar clusters`. O proximo prompt deve ser preenchido,
mas nao enviado.

O handoff paralelo `Registrar receita observada` abre o Aprendiz. Use
uma tela humana real e confirme que o prompt inicia com
`/consignado-aprendizado`. Ele pode escrever apenas em `docs/receitas/`.
Use uma referencia de teste como controle: o resultado correto e pedir
referencia humana, sem criar receita.

### 2. Comparador

Revise o prompt e envie. Confirme que a abertura do Comparador explica
o que falta para ele comparar, o que ele vai analisar, o que voce
recebera e que a proxima etapa sera o Generalizador. Confira a matriz
de fatos com evidencia dos dois clusters e que divergencia sem regra
vira `[CONFIRMAR]`. Ele termina apontando naturalmente o Generalizador,
sem schema ou template.

Clique em `Generalizar etapa` e confirme novamente que o prompt nao foi
enviado automaticamente.

### 3. Generalizador e Especializador

Envie o Generalizador, revise a proposta de nucleo e clique em
`Classificar especializacoes`. Envie o Especializador e confirme que a
saida classifica cada diferenca sem criar nada.

Antes de clicar em `Montar apos aprovacao`, tente seguir sem escrever
aprovacao. O Montador deve parar e pedir a aprovacao explicita.

### 4. Montador, Validador e promocao

Escreva uma aprovacao clara na conversa, por exemplo:

```text
APROVO a proposta consolidada da etapa <nome> para os clusters <lista>.
```

Clique em `Montar apos aprovacao`, confira que o prompt inicia com
`/consignado-montagem` e envie. A primeira resposta precisa explicar
o que o Montador precisa, o que ele vai montar, o que voce recebera e
que a proxima etapa sera a validacao. O detalhe tecnico pode listar
etapa, clusters, documentos, skills, scripts e bloqueios. No historico,
confirme que ela nao fez escrita no Figma.

Depois dessa abertura, o Montador trabalha somente no arquivo Figma
descartavel e preserva referencias. O resultado desta fase precisa ser
`_rascunho-*`, nunca `ref-*` componentizado nem `tpl-*` antecipado.

Clique em `Validar rascunho`, confira que o prompt inicia com
`/consignado-validacao`, envie e registre `APTO PARA PROMOCAO`,
`REPROVADO` ou `NAO VERIFICAVEL`. Confirme que o Validador nao escreveu
no Figma e que ele revisou screenshots da referencia, do rascunho e de
cada preview por mode.

Tente acionar a promocao sem um veredito apto: o Montador deve parar.
Com `APTO PARA PROMOCAO`, clique em `Promover rascunho validado`. Ele
roda `validatePromotion`, gera o carimbo e somente entao renomeia para
`etapa/tpl-*`.

## Resultados esperados

| Verificacao | Resultado esperado | PASSOU/FALHOU |
| --- | --- | --- |
| Agentes detectados | 7 agentes e 8 skills sem diagnostico | |
| MCP Figma | autenticado e ferramentas visiveis | |
| Handoffs | mudam o agente, preenchem prompt, `send: false` | |
| Leitor a Especializador | nenhuma escrita local ou no Figma | |
| Sem aprovacao | Montador para e pede decisao | |
| Abertura do Montador | resposta antes de escrita, com necessidade, acao, entrega e proximo passo claros; skills e scripts como apoio | |
| Com aprovacao | Montador cria somente `_rascunho-*` no arquivo descartavel | |
| Referencias | `ref-*` permanecem frames e nao recebem escrita | |
| Validador | nao corrige achados e devolve veredito de promocao | |
| Sem veredito apto | promocao para `tpl-*` e bloqueada | |
| Com veredito apto | `validatePromotion` passa antes de renomear e carimbar | |
| MCP desabilitado | agente reporta limitacao sem inventar evidencia | |

## Evidencia da rodada

Registre abaixo de cada execucao: data, versao do VS Code, versao da
extensao Copilot, nome do agente, link da pagina Figma, resultado e
qualquer falha de ferramenta. Nao registre regra de negocio ficticia.
