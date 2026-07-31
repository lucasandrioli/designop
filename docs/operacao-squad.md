# Operacao da Squad - Fase 0

## Objetivo desta fase

Provar que o designer pode iniciar uma rodada com varias etapas e receber
uma resposta unica, sem alternar entre agentes. Nesta fase a squad apenas
le os documentos existentes no repositorio.

Ela nao altera Figma, documentos oficiais, templates, variaveis ou
prototipos.

## Quem participa

| Papel | Visivel para o designer | Faz nesta fase |
| --- | --- | --- |
| Operador | sim | cria a rodada, chama leitores, agrupa resultado e perguntas |
| Leitor de etapa | nao | encontra catalogo, mapa, manuais e lacunas de uma etapa |
| Analista, Montador e Validador | nao participam | permanecem para as fases ja existentes do metodo |

## Inicio, meio e fim

1. O designer seleciona `operador` e informa duas ou tres etapas.
2. O Operador registra a rodada em `.designops/runs/`.
3. O Operador chama um Leitor por etapa, em paralelo.
4. Os Leitores devolvem cartoes curtos, sem editar nada.
5. O Operador consolida os cartoes em uma caixa de decisoes unica.
6. A rodada termina em `concluida` ou `aguardando_designer`.

O Operador nao inicia contexto ou analise automaticamente. A proxima fase
sempre depende de um novo pedido do designer.

## O que o designer precisa revisar

Somente perguntas de negocio que impedem continuar. Exemplos:

- qual cluster usa uma etapa ainda sem manual;
- qual mapa vale para uma modalidade;
- qual item marcado `[CONFIRMAR]` precisa ser definido antes da analise.

O designer nao revisa a busca de arquivos nem precisa trocar de agente
para receber cada resposta.

## Paralelismo e seguranca

Leituras de etapas independentes podem acontecer em paralelo. Nenhum
agente escreve no Figma nesta fase. O unico arquivo criado e o estado
temporario da rodada, ignorado pelo Git.

Nao existe operacao continua em segundo plano. Cada rodada comeca por um
pedido explicito do designer e termina com um resumo.
