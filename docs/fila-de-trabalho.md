# Fila de trabalho - Fase 0

Esta fila e temporaria e vive no estado de cada rodada. Ela nao substitui
os manuais, catalogos ou mapas de fluxo.

| Estado | Significa | Quem age depois |
| --- | --- | --- |
| `em_andamento` | leitores estao verificando documentos | Operador espera os resultados |
| `pronta_para_analise` | catalogo, mapa e dois ou mais manuais aplicaveis existem; pendencias nao bloqueantes podem permanecer | designer pode iniciar Analista em nova rodada |
| `precisa_contexto` | falta catalogo, mapa ou manual essencial | designer inicia `/consignado-contexto` |
| `bloqueada` | ha um `[CONFIRMAR]` que impede o recorte interno pedido | designer responde a pergunta agrupada pelo Operador |
| `aguardando_designer` | ha ao menos uma decisao de negocio pendente | designer decide e inicia uma nova rodada |
| `concluida` | todas as etapas receberam proximo passo claro | nenhuma acao automatica |

Na Fase 0, `concluida` nao significa que uma etapa foi analisada ou
montada. Significa apenas que a leitura preparatoria terminou.
