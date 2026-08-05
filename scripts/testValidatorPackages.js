#!/usr/bin/env node
/* Regressao dos recibos do Validador e de promocao. */
const assert = require('assert')
const childProcess = require('child_process')
const crypto = require('crypto')
const fs = require('fs')
const os = require('os')
const path = require('path')

const root = path.resolve(__dirname, '..')
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'designops-validator-packages-'))
const round = 'rodada-validador'
const runDirectory = path.join(fixture, '.designops', 'runs', round)
fs.mkdirSync(runDirectory, { recursive: true })

function write(name, data) {
  const file = path.join(runDirectory, name)
  fs.writeFileSync(file, typeof data === 'string' ? data : JSON.stringify(data, null, 2))
  return file
}
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function artifact(name) { const file = path.join(runDirectory, name); return { caminho: `.designops/runs/${round}/${name}`, sha256: hash(file) } }
function run(script, file) {
  return childProcess.spawnSync(process.execPath, [path.join(root, 'scripts', script), '--round', round, '--file', file, '--root', fixture], { encoding: 'utf8' })
}
function expectPass(result, message) { assert.strictEqual(result.status, 0, message + ': ' + result.stdout + result.stderr) }
function expectFail(result, message) { assert.notStrictEqual(result.status, 0, message) }

;['pacote-montagem.json', 'contrato.json', 'resolvido.json', 'evidencias-mcp.json', 'pre-promocao.json', 'criacao.json', 'conteudo.json', 'modes.json', 'layout.json', 'estrutura.json', 'interacoes.json', 'visual.json'].forEach((name) => write(name, { passed: true, name }))
const stamp = '2026-08-05T12:00:00.000Z'
const check = (tipo, name) => ({ tipo, resultado: 'FAVORAVEL', artefato: artifact(name), executadaEm: stamp })
const verdict = {
  schemaVersion: 1,
  rodada: round,
  emitidoEm: stamp,
  resultado: 'APTO_PARA_PROMOCAO',
  artefatosVinculados: [
    { papel: 'PACOTE_MONTAGEM', ...artifact('pacote-montagem.json') },
    { papel: 'CONTRATO', ...artifact('contrato.json') },
    { papel: 'RESOLUCAO', ...artifact('resolvido.json') },
    { papel: 'EVIDENCIAS_MCP', ...artifact('evidencias-mcp.json') },
    { papel: 'PRE_PROMOCAO', ...artifact('pre-promocao.json') },
  ],
  resultados: [
    { id: 'informacoes-ctx-a', template: 'informacoes-importantes', contextoId: 'ctx-a', resultado: 'FAVORAVEL', revisaoVisual: 'FAVORAVEL' },
    { id: 'informacoes-ctx-b', template: 'informacoes-importantes', contextoId: 'ctx-b', resultado: 'FAVORAVEL', revisaoVisual: 'FAVORAVEL' },
  ],
  verificacoes: [check('CRIACAO', 'criacao.json'), check('CONTEUDO', 'conteudo.json'), check('MODES', 'modes.json'), check('LAYOUT', 'layout.json'), check('PRE_PROMOCAO', 'pre-promocao.json')],
  releiturasIndependentes: [
    { tipo: 'ESTRUTURA', resultado: 'FAVORAVEL', independenteDaMontagem: true, artefato: artifact('estrutura.json'), executadaEm: stamp },
    { tipo: 'INTERACOES', resultado: 'FAVORAVEL', independenteDaMontagem: true, artefato: artifact('interacoes.json'), executadaEm: stamp },
  ],
  revisaoVisual: { resultado: 'FAVORAVEL', artefato: artifact('visual.json'), executadaEm: stamp },
  prePromocao: { resultado: 'FAVORAVEL', artefato: artifact('pre-promocao.json'), executadaEm: stamp },
}
const verdictFile = write('veredito-validador.json', verdict)
expectPass(run('validateValidatorVerdict.js', verdictFile), 'Veredito completo precisa passar')

const withoutLayout = JSON.parse(JSON.stringify(verdict))
withoutLayout.verificacoes = withoutLayout.verificacoes.filter((entry) => entry.tipo !== 'LAYOUT')
const withoutLayoutFile = write('veredito-sem-layout.json', withoutLayout)
expectFail(run('validateValidatorVerdict.js', withoutLayoutFile), 'Veredito apto sem prova direta de layout precisa reprovar')

const failedMode = JSON.parse(JSON.stringify(verdict))
failedMode.verificacoes.find((entry) => entry.tipo === 'MODES').resultado = 'REPROVADO'
const failedModeFile = write('veredito-modes-reprovado.json', failedMode)
expectFail(run('validateValidatorVerdict.js', failedModeFile), 'Veredito apto nao pode esconder modes reprovados')

const wrongHash = JSON.parse(JSON.stringify(verdict))
wrongHash.artefatosVinculados[0].sha256 = '0'.repeat(64)
const wrongHashFile = write('veredito-hash-divergente.json', wrongHash)
expectFail(run('validateValidatorVerdict.js', wrongHashFile), 'Hash divergente de artefato da rodada precisa reprovar')

write('aprovacao-promocao.json', { aprovacoes: { promocao: { tipo: 'PROMOCAO', decisao: 'APROVADA', confirmadoPor: 'DESIGNER', ocorreuEm: stamp } }, checkpoints: { promocao: { status: 'APROVADA' } } })
write('validacao-promocao.json', { passed: true })
write('releitura-publicada.json', { passed: true })
const promotion = {
  schemaVersion: 1,
  rodada: round,
  emitidoEm: stamp,
  aprovacaoKora: artifact('aprovacao-promocao.json'),
  veredito: artifact('veredito-validador.json'),
  validacaoPromocao: { origem: 'VALIDATE_PROMOTION', resultado: 'FAVORAVEL', artefato: artifact('validacao-promocao.json'), executadaEm: stamp },
  contextosProibidosNoNome: ['ctx-a', 'ctx-b'],
  ativosPublicados: [{ template: 'informacoes-importantes', nome: 'pcon/formalizacao/tpl-informacoes-importantes', tipo: 'COMPONENT', resultado: 'FAVORAVEL' }],
  releiturasPosPromocao: [{ template: 'informacoes-importantes', resultado: 'FAVORAVEL', artefato: artifact('releitura-publicada.json'), executadaEm: stamp }],
}
const promotionFile = write('pacote-promocao.json', promotion)
expectPass(run('validatePromotionPackage.js', promotionFile), 'Pacote de promocao completo precisa passar')

const contextLeak = JSON.parse(JSON.stringify(promotion))
contextLeak.ativosPublicados[0].nome = 'pcon/formalizacao/tpl-informacoes-ctx-a'
const contextLeakFile = write('pacote-promocao-contexto.json', contextLeak)
expectFail(run('validatePromotionPackage.js', contextLeakFile), 'Ativo publicado nao pode carregar contexto no nome')

const noApproval = JSON.parse(JSON.stringify(promotion))
write('kora-sem-aprovacao.json', { aprovacoes: { promocao: null }, checkpoints: { promocao: { status: 'AGUARDANDO_APROVACAO' } } })
noApproval.aprovacaoKora = artifact('kora-sem-aprovacao.json')
const noApprovalFile = write('pacote-promocao-sem-aprovacao.json', noApproval)
expectFail(run('validatePromotionPackage.js', noApprovalFile), 'Promocao sem aprovacao registrada pela Kora precisa reprovar')

console.log('Recibos do Validador aprovados: criacao, conteudo, modes, layout, releituras e promocao comprovada.')
