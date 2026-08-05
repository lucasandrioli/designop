#!/usr/bin/env node
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')
function args(argv) { const input = {}; for (let i = 0; i < argv.length; i += 1) if (argv[i].startsWith('--')) { input[argv[i].slice(2)] = argv[i + 1]; i += 1 } return input }
function hash(file) { return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex') }
function check(artifact, root, round, label, failures) { if (!artifact?.caminho || !/^[a-f0-9]{64}$/.test(artifact?.sha256 ?? '') || !artifact.caminho.startsWith(`.designops/runs/${round}/`)) { failures.push(label + ' invalido'); return }; const file = path.resolve(root, artifact.caminho); if (!fs.existsSync(file) || hash(file) !== artifact.sha256) failures.push(label + ' ausente ou alterado') }
const input = args(process.argv.slice(2)); const root = path.resolve(input.root ?? path.join(__dirname, '..')); const round = input.round; const failures = []; let data = null
try { data = JSON.parse(fs.readFileSync(path.join(root, '.designops/runs', round, 'pacote-composicao-montagem.json'), 'utf8')) } catch { failures.push('pacote de montagem da composicao ausente ou invalido') }
if (data) { if (data.schemaVersion !== 1 || data.rodada !== round || data.estado !== 'CONCLUIDA_PARA_VALIDACAO' || data.semPromocao !== true) failures.push('montagem da composicao fora do contrato'); check(data.prototipo, root, round, 'prototipo', failures); check(data.evidenciaMontagem, root, round, 'evidencia de montagem', failures) }
const passed = failures.length === 0; process.stdout.write(JSON.stringify({ passed, round: round ?? null, failures }, null, 2) + '\n'); process.exit(passed ? 0 : 1)
