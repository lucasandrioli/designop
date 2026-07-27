# Manual do convenio: Governo de Sao Paulo

RASCUNHO. Cluster novo, ainda sem levantamento completo — so as regras
abaixo foram confirmadas pelo designer ate agora (2026-07-25), a partir
de um teste do Modo Fluxos do agente comparador (docs/fila-de-testes.md,
Teste 11). Tudo que nao esta aqui e desconhecido, nao "nao existe" —
nao inferir ausencia por falta de informacao.

## Identificacao
- Cluster: gov-sp
- Mode na collection: [CONFIRMAR] (ainda nao criado em nenhuma
  collection real; so testado com telas cruas soltas)
- Orgao/convenio: Governo de Sao Paulo
- Modalidades ativas: [CONFIRMAR]

## Regras

### R1. A etapa de anuencia tem mais passos aqui do que no c4-federais
- Regra: apos a senha, a MESMA etapa "Anuencia" que existe no
  c4-federais tambem existe aqui, mas com mais passos: o cliente
  CONFIRMA ativamente (botao "Confirmar"), em vez de so aguardar como
  no federal (tela "Aguardando anuencia", onde e o orgao que confirma).
- Origem: confirmado pelo designer (2026-07-25). CORRECAO: uma leitura
  anterior desta mesma rodada tratou isso como "dois processos de
  negocio diferentes com o mesmo nome por coincidencia" — errado. E a
  MESMA etapa, com comportamento/quantidade de passos diferente por
  convenio (eixo 3, composicao de fluxo — igual a outras etapas do
  mapa que tem nivel 2 so em alguns clusters). Ver nota corrigida em
  docs/mapa-fluxo-piloto.md.
- Mecanismo: mapa de fluxo (etapa "Anuencia", nivel 1, presente em
  c4-federais e gov-sp, ausente em c1-mg; comportamento interno varia
  por convenio)
- Status: ATIVA

### R2. Cliente pode escolher canal de confirmacao (SMS ou e-mail)
- Regra: dentro da etapa Anuencia, o cliente tem a opcao de abrir uma
  tela de apoio para escolher como quer receber o codigo de
  confirmacao do orgao (SMS ou e-mail), antes de confirmar.
- Origem: confirmado pelo designer (2026-07-25): e tela de apoio
  OPCIONAL, nao obrigatoria no fluxo principal.
- Mecanismo: mapa de fluxo (nivel 2 da etapa Anuencia, so em gov-sp;
  gatilho = botao "Escolher canal de confirmacao")
- Status: ATIVA

## Regras que NAO se aplicam aqui
- [CONFIRMAR] ainda nao sabemos o suficiente sobre este convenio pra
  listar o que nao se aplica com confianca.

## Pendente de levantamento
Tudo que ainda nao foi testado neste convenio: consentimento de dados,
elegibilidade de seguro/portabilidade, valores/faixas de simulacao,
autorizacao de debito, resumo, efetivacao final. Nao assumir "nao" para
nenhuma dessas ate confirmar.

## Historico
- 2026-07-25: manual criado a partir do teste do Modo Fluxos (Teste 11,
  docs/fila-de-testes.md). R1 e R2 confirmadas pelo designer em
  resposta ao checklist do agente comparador.
