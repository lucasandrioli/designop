# Mapa de fluxo — consignado OP, primeira concessao (piloto: c1-mg, c4-federais)

| Etapa | Nivel | c1-mg | c4-federais | Gatilho | Template |
| --- | --- | --- | --- | --- | --- |
| Entrada (card oferta) | 1 | sim | sim | n/a | fora do escopo do lab |
| Consentimento de dados | 1 | nao | sim | n/a | tpl-consentimento |
| Dados consultados | 2 | nao | sim | botao secundario no consentimento | tpl-dados-consultados (sheet) |
| Simulacao | 1 | sim | sim | n/a | tpl-simulacao |
| Detalhe seguro consignado | 2 | sim | sim | trail do item; obrigatorio para remover | tpl-detalhe-seguro |
| Detalhe portabilidade | 2 | sim | sim | trail do item; obrigatorio para remover | tpl-detalhe-portabilidade |
| Autorizacao de debito (3 checks) | 1 | sim | sim | n/a (nao varia por cluster) | tpl-autorizacao-debito |
| Resumo (itens colapsaveis) | 1 | sim | sim | itens variam por cluster | tpl-resumo |
| Informacoes importantes | 1 | sim | sim | n/a | tpl-informacoes |
| Senha | 1 | sim | sim | n/a | tpl-senha |
| Anuencia externa | 1 | nao | sim | apos senha; retorno atualiza efetivacao | tpl-efetivacao (variant aguardando-anuencia) |
| Efetivacao | 1 | sim | sim | n/a | tpl-efetivacao (variant efetivado; tracking vertical, imprimir contrato, voltar, fechar) |
