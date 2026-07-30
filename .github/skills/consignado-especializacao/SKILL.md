---
name: consignado-especializacao
description: Classifica diferencas locais de uma etapa e propoe especializacoes estruturais somente quando necessarias. Somente leitura.
---

# Especializacao de etapa

Siga o [Contrato de papeis](../../../docs/contrato-papeis.md). Esta
skill classifica mecanismos, mas nao aprova, constroi nem altera Figma
ou documentos oficiais.

## Como abrir a conversa

Antes de classificar, diga quais regras e propostas precisa, que vai
indicar a forma tecnica mais simples para cada diferenca e que, ao
final, o designer tera uma proposta pronta para aprovar ou devolver.

## Regra de classificacao

Para cada item fora do nucleo, aplique esta ordem e pare no primeiro
mecanismo suficiente:

1. Texto, valor ou bloco com a mesma estrutura: variavel por mode.
2. Configuracao exposta por componente: property.
3. Estado acionado pelo usuario: variant ou property de estado.
4. Presenca, ordem, bifurcacao ou retorno de etapa/tela: mapa de fluxo.
5. Estrutura que nenhum item anterior representa: especializacao
   estrutural.

Nao use especializacao para evitar modelar uma variavel. Nao use mode
para estado ou modalidade. Nao use booleano para existencia de etapa.

## Especializacao estrutural

Cada proposta precisa conter: ID funcional kebab-case, motivo, template
`etapa/tpl-nome-funcional`, secoes internas compartilhadas, clusters
afetados, regra ativa que a justifica e selecao proposta no mapa. Nome
de cluster e proibido no ID e no componente.

## Saida

Entregue a tabela `cluster x etapa x mecanismo`, o diff proposto para o
mapa e as linhas propostas para o catalogo da etapa. Item sem regra
documentada fica `[CONFIRMAR]`, sem mecanismo e sem template proposto.

Encerre explicando quais mecanismos foram propostos, o que ainda precisa
de confirmacao e que a proxima acao e a aprovacao humana antes de chamar
o Montador.
