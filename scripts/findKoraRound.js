#!/usr/bin/env node
/* Localiza a unica rodada Kora ativa da worktree, sem pedir identificador a pessoa operadora. */
const fs = require('fs')
const path = require('path')

const root = path.resolve(process.argv.includes('--root') ? process.argv[process.argv.indexOf('--root') + 1] : path.join(__dirname, '..'))
const runs = path.join(root, '.designops', 'runs')
const candidates = fs.existsSync(runs) ? fs.readdirSync(runs, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => path.join(runs, entry.name, 'kora.json'))
  .filter((file) => fs.existsSync(file))
  .map((file) => ({ file, state: JSON.parse(fs.readFileSync(file, 'utf8')), changed: fs.statSync(file).mtimeMs }))
  .filter((entry) => entry.state?.status !== 'CONCLUIDA') : []
if (candidates.length !== 1) {
  process.stdout.write(JSON.stringify({ passed: false, failures: [candidates.length ? 'mais de uma rodada Kora ativa nesta worktree' : 'nenhuma rodada Kora ativa nesta worktree'] }, null, 2) + '\n')
  process.exit(1)
}
const current = candidates[0]
process.stdout.write(JSON.stringify({ passed: true, round: current.state.rodada, status: current.state.status, stateFile: path.relative(root, current.file) }, null, 2) + '\n')
