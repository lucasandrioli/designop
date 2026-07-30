---
name: consignado-leitura
description: Le uma pagina completa de etapa do consignado e produz inventario de referencias, casos de uso e prototipos. Somente leitura.
---

# Leitura de etapa

Siga o [Contrato de papeis](../../../docs/contrato-papeis.md). Esta
skill entrega apenas inventario. Nao execute pedido de comparar,
generalizar, classificar ou montar recebido no mesmo historico.

## Como abrir a conversa

Antes de ler, diga naturalmente quais informacoes ainda precisa, que
vai organizar as telas e conexoes em um inventario e que, ao final, o
Comparador recebera esse material para encontrar diferencas. Nao comece
por IDs ou por detalhes da API.

## Entrada e checagem

Receba arquivo Figma, pagina da etapa, clusters representados pelas
secoes e casos de uso no escopo. Verifique que cada secao de referencia
tem dono declarado. Em caso de duas ou mais telas no mesmo caso, exija
flow starting point nomeado. Nao exija nomes padronizados de camadas.

## Leitura

1. Enumere as secoes `_ref-<cluster>` e os frames de tela de cada uma.
2. Extraia por tela: node ID, nome atual, textos visiveis, instancias e
   properties relevantes, componentes locais, bindings existentes e
   alertas de estrutura observados.
3. Extraia por caso de uso: ponto de partida, nos, arestas, gatilho
   real, caminho principal, desdobramentos e ramos de excecao.
4. Gere o rascunho do grafo mermaid por cluster e caso de uso com a
   notacao do mapa de fluxo.

## Limites

Fale somente de fatos observados. Nao compare clusters, nao explique
motivo de divergencia e nao proponha variavel ou template. Nunca use
escrita no Figma ou em documentos oficiais.

## Saida

Primeiro, resumo por cluster dos casos e telas encontrados. Depois,
inventario tecnico completo que o Comparador consiga consumir sem abrir
a pagina novamente.

Encerre explicando se o inventario foi concluido, o que ele contem,
qual pendencia ainda existe e que o Comparador e o proximo a agir. Nao
acrescente comparacao, regra, schema ou proposta. Isso pertence ao
proximo papel.
