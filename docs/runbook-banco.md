# Runbook: primeiro dia no ambiente do banco

Principio que rege este documento: teste que nao usa o mecanismo real
valida menos do que aparenta. A bateria do lab (6/6) validou o METODO
no nivel 2 de fidelidade (Mini DS). Este runbook valida o AMBIENTE
(nivel 3, IDS real) antes de qualquer construcao.

## Regua de fidelidade (vale para todo o projeto)
- Nivel 1, telas cruas: prova topologia e logica. NAO prova mecanismo.
- Nivel 2, Mini DS (lab): prova o mecanismo (componentes remotos,
  overrides, reactions em instancia, modes). NAO prova o ambiente.
- Nivel 3, IDS real no banco: prova o ambiente. So aqui algo pode ser
  chamado de "pronto para uso".
Toda afirmacao de "validado" deve declarar o nivel.

## Bateria de fumaca (rodar ANTES de construir qualquer coisa)
Meia tarde de trabalho. Em um arquivo de teste descartavel:

1. CONEXAO: MCP do Figma autentica no VS Code corporativo; seat e
   Dev/Full (View/Collab = 6 calls/mes, inviavel).
2. BIBLIOTECAS: get_libraries lista as 4 libs do IDS (componentes,
   tokens, icones, ilustras). Anotar as library keys.
3. IMPORTACAO: importComponentByKeyAsync com a key de um botao real do
   IDS. Instanciar. Conferir remote=true.
4. PROPERTIES: setProperties num componente complexo do IDS (item de
   lista com tag/suporte/midia). Conferir que as keys reais funcionam.
5. OVERRIDE PROFUNDO (maior risco residual): bindar variavel no texto
   interno de uma instancia complexa do IDS (instancia dentro de
   instancia). Se falhar silenciosamente, o desenho do binding muda:
   testar via property exposta em vez de no interno.
6. REACTIONS: setReactionsAsync numa instancia de botao do IDS; extrair
   de volta e ler o rotulo interno.
7. MODES: criar collection de teste com 2 modes; conferir limite de
   modes do plano da org (5 clusters exigem 5+; Enterprise = 40).
8. RECONSTRUCAO: em um frame descartavel, testar
   `validateReconstructionContract` com uma instancia IDS correta e
   depois com um componente destacado, uma ordem de filhos errada e uma
   caixa deslocada mais de 2 px. Os tres precisam reprovar nos blocos
   IDS, arvore e geometria, respectivamente.
9. COMPOSICAO: pesquisar um card real do IDS e conferir properties e
   slots antes de tentar usa-lo. Sem slot para o conteudo desejado, o
   resultado esperado e `[CONFIRMAR]` ou `SEM_EQUIVALENTE`, nunca anexar
   um filho dentro da instancia.
10. VALIDADOR: rodar validateLayout numa tela real existente do
    consignado; conferir que bounding box e clipsContent se comportam
    igual ao lab.
11. SCREENSHOT: testar get_screenshot. Se for bloqueado no ambiente,
   registrar e definir a revisao visual manual do designer antes de
   promover qualquer rascunho. Validacao matematica sozinha nao libera
   `tpl-*`.
12. ESCALA: get_metadata numa pagina real do consignado (arquivos
    grandes); observar payload e rate limit.
13. SKILLS: selecione Analista, dispare `/consignado-analise` e
    confirme que ele le sem escrever e entrega uma proposta com
    arvore-alvo, mapa IDS e contrato geometrico. Em seguida selecione
    Montador, dispare `/consignado-montagem` e
    confirme que a primeira resposta retoma o que ja esta aprovado,
    explica o que ele vai conferir sozinho e pede somente a pendencia
    real, sem escrita no Figma. No handoff de validacao, confira
    `/consignado-validacao` e confirme que os links para scripts e
    Plugin API e Reconstrucao Figma foram carregados antes da validacao.

Cada item: PASSOU / FALHOU + nota. Item 5 falhou = parar e redesenhar
o binding antes de seguir. Itens 8 e 9 falhos bloqueiam montagem no IDS
real. Demais falhas: avaliar contorno.

## Riscos residuais conhecidos (o que o lab NAO provou)
- Override de texto bindado em aninhamento profundo do IDS (item 5)
- Comportamento com 4 bibliotecas simultaneas e naming real
- Rate limits com arquivos de producao (grandes)
- Restricoes corporativas: screenshot, rede, extensoes
- Diferencas praticas Copilot vs Claude Code na execucao das skills
  (a abertura do Montador e o teste 11 tornam isso observavel)
- Publish/aceite de updates em lib com dezenas de consumidores
