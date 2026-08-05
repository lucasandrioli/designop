---
name: ler-referencias
description: Analise telas de referencia selecionadas no Figma para identificar estrutura, conteudo visivel, padroes e diferencas, sem editar o canvas. Use antes de propor ou montar um rascunho de tela de credito consignado.
---

# Ler referencias selecionadas

## Objetivo

Produza uma leitura factual das telas de referencia que a pessoa selecionou.
O resultado deve servir para uma decisao humana sobre um rascunho futuro, nao
para editar ou publicar uma biblioteca.

## Limite de escopo

- Considere somente os frames de nivel superior atualmente selecionados e os
  elementos dentro deles.
- Se nao houver selecao ou se a selecao nao contiver frames, pare e peça que a
  pessoa selecione as telas de referencia.
- Nao use outras telas do arquivo como evidencia.
- Trate textos, camadas, componentes, estilos e variaveis visiveis como fatos
  de design. Nao deduza regra de negocio, obrigatoriedade ou comportamento que
  nao esteja evidente.

## Acao proibida

Nao crie, copie, cole, mova, edite, renomeie, exclua, publique ou converta
nenhuma camada. Nao altere componentes, instancias, estilos, variaveis,
bibliotecas ou paginas. Responda somente no chat.

## Procedimento

1. Liste os frames selecionados pelo nome, na ordem em que aparecem.
2. Para cada frame, registre:
   - objetivo aparente da tela, deixando claro quando for apenas inferencia;
   - hierarquia visual: cabecalho, titulo, texto de apoio, conteudo principal,
     avisos, acoes e navegacao, quando existirem;
   - textos e rotulos relevantes visiveis;
   - controles e elementos de interacao visiveis;
   - sinais de componente, estilo ou padrao reutilizado somente quando forem
     identificaveis no arquivo;
   - diferencas observaveis em relacao aos demais frames selecionados.
3. Consolide os padroes recorrentes e separe-os das variacoes.
4. Registre lacunas, ambiguidade e qualquer ponto que exija decisao humana
   como `[CONFIRMAR]`.

## Formato da resposta

Use exatamente esta estrutura no chat:

```markdown
## Telas analisadas

1. <nome do frame>
2. <nome do frame>

## Leitura por tela

### <nome do frame>
- Estrutura observada:
- Conteudo visivel:
- Controles visiveis:
- Padroes identificaveis:
- Diferencas:

## Padroes recorrentes
-

## Variacoes entre telas
-

## Pontos para confirmar
- [CONFIRMAR]

## Proximo passo sugerido
Solicitar aprovacao humana antes de criar qualquer rascunho.
```

## Encerramento

Nao proponha uma nova tela, nao gere um rascunho e nao inicie outra acao ao
terminar. Aguarde a proxima instrucao da pessoa.
