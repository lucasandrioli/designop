# Operacao guiada do Analista

## O que a pessoa operadora fornece

Em um unico envio:

```text
Figma: <URL>
Sections: <nomes exatos, separados por virgula>
Contexto curto: <uma frase opcional>
```

O Analista descobre pagina, IDs, modalidade, etapa, sinais de contexto,
estrutura e reacoes. A pessoa operadora nao fornece node IDs, schemas,
comandos, manuais ou arquivos temporarios.

Antes de interpretar a referencia, o Analista le a base aplicavel. Para cada
achado relevante, ele registra o confronto entre a tela e o manual global,
manual de modalidade, catalogo da etapa e manual de contexto quando existir.
Tela confirma somente fato observado; regra de negocio continua exigindo a
fonte documental ou decisao humana.

## O que a conversa mostra

1. **Recebi o material:** confirma as referencias recebidas.
2. **Estou analisando:** informa progresso breve por Section.
3. **O que encontrei:** apresenta telas, caminhos, componentes e diferencas.
4. **Proposta pronta para sua revisao:** resume mapa, contratos, variaveis
   e componentes candidatos, sempre como proposta temporaria.
5. **So preciso da sua decisao nestes pontos:** no maximo tres perguntas,
   cada uma com impacto e recomendacao.

O resumo tambem separa **o que a base ja estabelece** de **o que a referencia
traz para decidir**. Assim, a pessoa operadora nao precisa reabrir manuais
para entender por que uma pergunta apareceu.

Termos internos como schema, paginacao, `[CONFIRMAR]`, reconciliacao e
gates permanecem nos artefatos auditaveis. Eles nao aparecem no resumo para
a pessoa operadora.

## Autonomia e limites

O Analista continua a leitura tecnica quando faltar regra de negocio. Ele
registra a lacuna internamente e prepara a melhor proposta possivel. So pede
ajuda quando a referencia nao existe ou e ambigua, quando a ferramenta nao
consegue concluir a leitura depois de recuperacao limitada, ou quando uma
decisao humana altera estrutura, jornada ou aprovacao.

O Analista nao escreve no Figma, nao publica biblioteca e nao entrega ao
Montador antes da aprovacao humana explicita. O Montador e o Validador
continuam com os mesmos gates tecnicos e checkpoints.

## Estado interno

Cada rodada guarda `.designops/runs/<rodada>/estado-analista.json`. O
Analista o inicia com `startAnalystRun.js`, atualiza durante a coleta e usa
`renderAnalystStatus.js --write` para gerar `resumo-operador.md` e
`pacote-analista.md`. O estado humano nao substitui referencias, manifesto,
contexto, reconciliacao ou contratos; ele apenas os torna acompanhaveis.

Quando a proposta estiver pronta, a rodada tambem guarda
`pacote-analista.json`. Esse recibo confere, por hash, o recorte, as coletas,
o contexto, o plano logico de variaveis, o plano de componentes e os
rascunhos temporarios de mapa e contratos. A resolucao de IDs entra somente
quando a propria proposta a exigir. O resumo mostrado para voce nessa etapa
e gerado a partir desse pacote, para que a conversa e a evidencia interna
descrevam a mesma proposta. O pacote nao libera montagem nem escreve na
biblioteca: ele apenas permite pedir sua aprovacao de contrato.
