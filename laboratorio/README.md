# Laboratorio: evidencia, nao conhecimento

Tudo nesta pasta foi produzido num ambiente de teste (arquivos Figma
"Lab — Mini DS" e "Lab — Consignado Piloto"), com convenios, regras e
componentes INVENTADOS para forcar o sistema a quebrar.

## Os agentes NAO devem ler esta pasta

Nenhum agente aponta para ca. Os caminhos que eles leem sao
`docs/clusters/`, `docs/etapas/`, `docs/receitas/` e
`docs/mapa-fluxo-*.md` — que no dia 0 estao vazios, so com os moldes.
Isso e proposital: a checagem inicial do comparador PARA e pede o
manual do convenio em vez de comecar sem ele.

Se algum arquivo daqui for copiado para `docs/`, o agente vai tratar
ficcao como regra de convenio. Exemplo concreto: `clusters/c1-mg.md`
afirma que "a oferta de portabilidade so aparece se o cliente recebe
salario em outro banco". Ninguem do produto confirmou isso — eu inventei
para ter o que comparar. Um agente lendo aquilo constroi em cima de uma
regra falsa e nao tem como saber.

## Para que serve entao

Tres coisas:

1. **Justificar a doutrina.** Quase toda regra em `docs/` e nas skills
   tem uma citacao do tipo "(Teste 12, laboratorio/fila-de-testes.md)".
   Quando alguem no banco perguntar "por que essa regra existe?", a
   resposta esta em `fila-de-testes.md` — 16 testes com o que quebrou.
2. **Servir de exemplo preenchido.** `clusters/c1-mg.md` e um molde
   `_template.md` preenchido de verdade. Util para ver o formato
   esperado; inutil como conteudo.
3. **Provar que o pipeline fecha.** O ciclo completo (comparar ->
   aprovar -> montar -> validar) rodou ponta a ponta aqui antes de
   qualquer coisa ser proposta para o banco.

## Conteudo

| Arquivo | O que e |
| --- | --- |
| `fila-de-testes.md` | Diario dos 16 testes. A evidencia principal |
| `clusters/*.md` | Manuais de convenio ficticios (c1-mg, c4-federais, gov-sp) |
| `etapas/simular-e-contratar.md` | Doc de etapa preenchido no lab |
| `mapa-fluxo-piloto.md` | Mapa de fluxo do piloto ficticio |
| `receitas/*.md` | Receitas extraidas pelo aprendiz das telas do lab. Descrevem componentes do Mini DS que NAO existem no IDS real |
