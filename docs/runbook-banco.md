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
2. BIBLIOTECAS: em referencias que ja usam o IDS, recuperar a
   `mainComponent.key` de uma instancia remota e pesquisar uma vez pelo
   nome exato para obter a `libraryKey`. Anotar uma key por fonte real
   usada, como componentes, tokens, icones e ilustracoes, e restringir
   as buscas seguintes com `includeLibraryKeys`. So sem instancia ou
   candidato suficiente chamar `get_libraries`; nesse caso, consumir
   apenas `libraries_added_to_file`, nunca o catalogo
   `libraries_available_to_add`.
3. IMPORTACAO: descobrir `assetType` e key a partir de uma instancia real
   ou de `search_design_system` restrito a biblioteca conectada. Colar
   `scripts/inspectRemoteComponent.js` com key, assetType e libraryKey. Os
   tres campos sao obrigatorios.
   Conferir `remote=true` e as properties devolvidas. Falha de importacao
   bloqueia o candidato, sem fallback silencioso.
4. PROPERTIES: em componente variante, ler definitions no COMPONENT_SET;
   em instancia, ler `componentProperties`. Testar `setProperties` num
   componente complexo do IDS (item de
   lista com tag/suporte/midia). Conferir que as keys reais funcionam.
5. OVERRIDE PROFUNDO (maior risco residual): bindar variavel no texto
   interno de uma instancia complexa do IDS (instancia dentro de
   instancia). Se falhar silenciosamente, o desenho do binding muda:
   testar via property exposta em vez de no interno.
6. REACTIONS: setReactionsAsync numa instancia de botao do IDS; extrair
   de volta e ler o rotulo interno.
7. MODES: criar collection de teste com 2 modes; conferir limite de
   modes do plano da org (5 contextos exigem 5+; Enterprise = 40).
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
13. SKILLS: com a base documental aprovada, selecione Analista e dispare
    `/consignado-contexto`; confirme que ele le os manuais antes de
    perguntar regra, le o Figma sem escrever e registra somente mapa ou
    proposta de curadoria depois de aprovacao humana. Em seguida, dispare
    `/consignado-analise` e confirme que ele le sem escrever e entrega
    uma proposta com arvore-alvo, mapa IDS e contrato geometrico. Em seguida selecione
    Montador, dispare `/consignado-montagem` e
    confirme que a primeira resposta retoma o que ja esta aprovado,
    explica o que ele vai conferir sozinho e pede somente a pendencia
    real, sem escrita no Figma. Na conversa de validacao, confira
    `/consignado-validacao` e confirme que os links para scripts e
    Plugin API e Reconstrucao Figma foram carregados antes da validacao.
14. RETOMADA: depois de registrar uma etapa, abra um chat novo e cite
    somente seu nome. O agente deve recuperar catalogo, mapa e manuais
    sozinho, resumir o que encontrou e pedir apenas o recorte que faltar.
    Sem manual-base, deve apontar `/consignado-base`, nunca tratar conversa
    anterior como regra.
15. INSTANCIAS E RODAPE: tentar somente `setProperties` numa instancia e
    confirmar que composicao extra entra como irma, nunca como filha da
    instancia. Em frame rolavel, testar `overflowDirection = 'VERTICAL'`,
    anexar o rodape por ultimo e conferir `numberOfFixedChildren` e o limite
    inferior. Os valores validos de overflow sao `NONE`, `HORIZONTAL`,
    `VERTICAL` e `BOTH`.

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
