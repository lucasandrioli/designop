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
8. VALIDADOR: rodar validateLayout numa tela real existente do
   consignado; conferir que bounding box e clipsContent se comportam
   igual ao lab.
9. SCREENSHOT: testar get_screenshot. Se for bloqueado no ambiente,
   registrar e definir a revisao visual manual do designer antes de
   promover qualquer rascunho. Validacao matematica sozinha nao libera
   `tpl-*`.
10. ESCALA: get_metadata numa pagina real do consignado (arquivos
    grandes); observar payload e rate limit.
11. SKILLS: selecione Montador, dispare `/consignado-montagem` e
    confirme que a primeira resposta explica naturalmente o que ele
    precisa, vai fazer, entregara e o proximo passo, sem escrita no
    Figma. No handoff de validacao, confira
    `/consignado-validacao` e confirme que os links para scripts e
    Plugin API foram carregados antes da validacao.

Cada item: PASSOU / FALHOU + nota. Item 5 falhou = parar e redesenhar
o binding antes de seguir. Demais falhas: avaliar contorno.

## Riscos residuais conhecidos (o que o lab NAO provou)
- Override de texto bindado em aninhamento profundo do IDS (item 5)
- Comportamento com 4 bibliotecas simultaneas e naming real
- Rate limits com arquivos de producao (grandes)
- Restricoes corporativas: screenshot, rede, extensoes
- Diferencas praticas Copilot vs Claude Code na execucao das skills
  (a abertura do Montador e o teste 11 tornam isso observavel)
- Publish/aceite de updates em lib com dezenas de consumidores
