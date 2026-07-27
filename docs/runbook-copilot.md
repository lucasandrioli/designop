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
`[CONFIRMAR]` em vez de regra inventada. Nunca use `laboratorio/` como
fonte de negocio.

Anote antes de cada rodada: etapa, clusters, pagina Figma, secoes
`_ref-<cluster>` e casos de uso esperados.

## Teste da cadeia manual

### 1. Leitor

Selecione `Leitor` no menu de agentes e peca o inventario da pagina da
etapa. Confirme que ele lista fatos, telas e conexoes, sem propor
variavel, template ou alteracao. No historico de ferramentas, confira
que nao houve script com escrita no Figma.

Clique em `Comparar clusters`. O proximo prompt deve ser preenchido,
mas nao enviado.

### 2. Comparador

Revise o prompt e envie. Confirme que a resposta e uma matriz de fatos
com evidencia dos dois clusters e que divergencia sem regra vira
`[CONFIRMAR]`.

Clique em `Generalizar etapa` e confirme novamente que o prompt nao foi
enviado automaticamente.

### 3. Generalizador e Especializador

Envie o Generalizador, revise a proposta de nucleo e clique em
`Classificar especializacoes`. Envie o Especializador e confirme que a
saida classifica cada diferenca sem criar nada.

Antes de clicar em `Montar apos aprovacao`, tente seguir sem escrever
aprovacao. O Montador deve parar e pedir a aprovacao explicita.

### 4. Montador e Validador

Escreva uma aprovacao clara na conversa, por exemplo:

```text
APROVO a proposta consolidada da etapa <nome> para os clusters <lista>.
```

Clique em `Montar apos aprovacao`, revise o prompt e envie. O Montador
trabalha somente no arquivo Figma descartavel e preserva referencias.
Clique em `Validar entrega`, envie e registre passou ou reprovou.

## Resultados esperados

| Verificacao | Resultado esperado | PASSOU/FALHOU |
| --- | --- | --- |
| Agentes detectados | 7 agentes e 7 skills sem diagnostico | |
| MCP Figma | autenticado e ferramentas visiveis | |
| Handoffs | mudam o agente, preenchem prompt, `send: false` | |
| Leitor a Especializador | nenhuma escrita local ou no Figma | |
| Sem aprovacao | Montador para e pede decisao | |
| Com aprovacao | Montador altera somente o arquivo descartavel | |
| Validador | nao corrige achados | |
| MCP desabilitado | agente reporta limitacao sem inventar evidencia | |

## Evidencia da rodada

Registre abaixo de cada execucao: data, versao do VS Code, versao da
extensao Copilot, nome do agente, link da pagina Figma, resultado e
qualquer falha de ferramenta. Nao registre regra de negocio ficticia.
