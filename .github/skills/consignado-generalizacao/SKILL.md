---
name: consignado-generalizacao
description: Deriva a proposta de nucleo reutilizavel e template-base de uma etapa a partir de inventario e comparacao aprovaveis. Somente leitura.
---

# Generalizacao de etapa

Siga o [Contrato de papeis](../../../docs/contrato-papeis.md). Esta
skill propoe nucleo e candidatos a variavel. Ela nao classifica o
restante, nao aprova proposta e nao escreve no Figma.

## Entrada obrigatoria

Leia o catalogo da etapa, manuais dos clusters, inventario do Leitor e
matriz do Comparador. Se uma divergencia estiver sem regra documentada,
nao a absorva no nucleo: mantenha `[CONFIRMAR]`.

## Metodo

1. Agrupe telas pareadas por caso de uso e determine o que aparece em
   todos os clusters comparados.
2. Proponha um template-base por tela do nucleo, com nome
   `etapa/tpl-nome`.
3. Identifique secoes repetidas candidatas a `_secoes/nome`.
4. Para conteudo que diverge e preserva a mesma estrutura, proponha
   variavel por cluster: string, boolean ou number. Texto identico nao
   vira variavel.
5. Liste tudo que nao pode ser explicado pelo nucleo sem forcar a
   estrutura. Encaminhe para o Especializador, sem decidir o mecanismo.

## Saida

Entregue proposta marcada `[PROPOSTA]`: nucleo, templates-base, secoes
internas, contrato de variaveis e itens pendentes de especializacao. A
saida nao autoriza escrita: so o checkpoint humano libera o Montador.

Encerre com o pacote:

```text
[PAPEL CONCLUIDO] Generalizador
[ENTREGA] proposta de nucleo e candidatos a variavel
[PENDENCIAS] <lista ou nenhuma>
[PROXIMO PAPEL] Especializador
```
