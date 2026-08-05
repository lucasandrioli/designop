#!/usr/bin/env node
/* Reproduz a falha observada: Kora delegando antes de iniciar a rodada. */
const assert = require('assert')
const fs = require('fs')
const os = require('os')
const path = require('path')
const childProcess = require('child_process')

const root = fs.mkdtempSync(path.join(os.tmpdir(), 'kora-session-guard-'))
const source = path.resolve(__dirname, '..')
fs.mkdirSync(path.join(root, 'scripts'), { recursive: true })
fs.mkdirSync(path.join(root, '.designops', 'audit'), { recursive: true })
for (const name of ['initializeKoraSession.js', 'findKoraRound.js', 'enforceKoraToolPolicy.js', 'authorizeKoraAction.js', 'koraRoundState.js', 'validateKoraStateCore.js', 'validateMomentScopeCore.js', 'validateKoraPackages.js', 'validatePromotionPackageCore.js', 'validateValidatorVerdictCore.js']) {
  fs.copyFileSync(path.join(source, 'scripts', name), path.join(root, 'scripts', name))
}
function run(script, input, args = []) {
  return childProcess.spawnSync(process.execPath, [path.join(root, 'scripts', script), ...args], { cwd: root, input: input ? JSON.stringify(input) : '', encoding: 'utf8' })
}
function decision(result) {
  return JSON.parse(result.stdout || '{}').hookSpecificOutput?.permissionDecision ?? 'allow'
}
const sessionId = 'sessao-kora-teste'
const deniedBeforeStart = run('enforceKoraToolPolicy.js', { cwd: root, sessionId, toolCalls: [{ name: 'Agent', args: JSON.stringify({ name: 'analista-pcon-formalizacao' }) }] })
assert.equal(decision(deniedBeforeStart), 'deny', 'Kora bloqueia delegacao sem rodada preparada')
const initialized = run('initializeKoraSession.js', {
  cwd: root,
  sessionId,
  prompt: 'Figma: https://www.figma.com/design/arquivo-teste/Teste\nEtapa: formalizacao\nMomento: autorizar-debitos\nTelas e anexos:\n- Central: principal\n- Detalhes: detalhe aberto pela Central\nModalidades: PCon, Refin\nSections:\n- ref-pcon-formalizacao-ctx-01\n- ref-pcon-formalizacao-ctx-02\nContexto curto: comparacao',
})
assert.equal(initialized.status, 0, initialized.stderr)
const found = run('findKoraRound.js')
assert.equal(found.status, 0, found.stderr)
const round = JSON.parse(found.stdout).round
const deniedWithoutAuthorization = run('enforceKoraToolPolicy.js', { cwd: root, sessionId, toolCalls: [{ name: 'Agent', args: JSON.stringify({ name: 'analista-pcon-formalizacao' }) }] })
assert.equal(decision(deniedWithoutAuthorization), 'deny', 'Kora bloqueia Analista sem autorizacao')
const authorization = run('authorizeKoraAction.js', null, ['--round', round, '--role', 'ANALISTA', '--action', 'ANALISAR', '--root', root])
assert.equal(authorization.status, 0, authorization.stderr)
const allowedOnce = run('enforceKoraToolPolicy.js', { cwd: root, sessionId, toolCalls: [{ name: 'Agent', args: JSON.stringify({ name: 'analista-pcon-formalizacao' }) }] })
assert.equal(decision(allowedOnce), 'allow', 'Kora libera a delegacao autorizada')
const deniedReuse = run('enforceKoraToolPolicy.js', { cwd: root, sessionId, toolCalls: [{ name: 'Agent', args: JSON.stringify({ name: 'analista-pcon-formalizacao' }) }] })
assert.equal(decision(deniedReuse), 'deny', 'autorizacao nao pode ser reutilizada')
const deniedWrite = run('enforceKoraToolPolicy.js', { cwd: root, sessionId, toolCalls: [{ name: 'Write', args: JSON.stringify({ path: 'proposta-mapa.md' }) }] })
assert.equal(decision(deniedWrite), 'deny', 'Kora nao cria rascunho fora da rodada por escrita direta')
const deniedFigma = run('enforceKoraToolPolicy.js', { cwd: root, sessionId, toolCalls: [{ name: 'figma-get_design_context', args: '{}' }] })
assert.equal(decision(deniedFigma), 'deny', 'Kora nao le Figma diretamente')
const state = JSON.parse(fs.readFileSync(path.join(root, '.designops', 'runs', round, 'kora.json'), 'utf8'))
assert.equal(state.status, 'ANALISANDO', 'a autorizacao inicia a fase de analise de modo verificavel')
console.log('Protecao de sessao da Kora aprovada.')
