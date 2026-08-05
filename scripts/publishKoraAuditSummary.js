#!/usr/bin/env node
/* Copia somente o relato sanitizado para uma worktree dedicada audit/kora. */
const childProcess = require('child_process')
const fs = require('fs')
const path = require('path')

function args(argv) {
  const input = {}
  for (let index = 0; index < argv.length; index += 1) {
    if (!argv[index].startsWith('--')) continue
    const key = argv[index].slice(2)
    if (key === 'push') input.push = true
    else { input[key] = argv[index + 1]; index += 1 }
  }
  return input
}
function run(command, commandArgs, cwd) {
  return childProcess.spawnSync(command, commandArgs, { cwd, encoding: 'utf8' })
}
function safeRound(value) {
  return /^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(String(value ?? '')) ? value : null
}

const input = args(process.argv.slice(2))
const root = path.resolve(input.root ?? path.join(__dirname, '..'))
const round = safeRound(input.round)
const archiveRoot = input['archive-root'] ? path.resolve(input['archive-root']) : null
const failures = []
if (!round) failures.push('informe --round com identificador valido')
if (!archiveRoot || !fs.existsSync(archiveRoot)) failures.push('informe --archive-root de uma worktree audit/kora existente')
const source = round ? path.join(root, '.designops', 'audit', 'rodada-' + round) : null
for (const name of ['relato-kora.md', 'manifesto-auditoria.json']) if (source && !fs.existsSync(path.join(source, name))) failures.push('relato sanitizado ausente: ' + name)
const validation = round ? run(process.execPath, [path.join(root, 'scripts', 'validateKoraAuditTrail.js'), '--round', round, '--root', root], root) : null
if (validation && validation.status !== 0) failures.push('trilha local reprovada antes da publicacao')
let branch = null
if (archiveRoot && fs.existsSync(archiveRoot)) {
  const result = run('git', ['branch', '--show-current'], archiveRoot)
  branch = result.status === 0 ? result.stdout.trim() : null
  if (branch !== 'audit/kora') failures.push('archive-root precisa estar na branch audit/kora')
}
if (failures.length) {
  process.stderr.write(JSON.stringify({ passed: false, failures }) + '\n')
  process.exit(1)
}
const destination = path.join(archiveRoot, 'relatos', round)
const initialPublication = !fs.existsSync(destination)
const copied = []
if (initialPublication) {
  fs.mkdirSync(destination, { recursive: true })
  for (const name of ['relato-kora.md', 'manifesto-auditoria.json']) {
    fs.copyFileSync(path.join(source, name), path.join(destination, name))
    copied.push(name)
  }
}
const sourceIncidents = path.join(source, 'incidentes')
if (fs.existsSync(sourceIncidents)) {
  for (const incident of fs.readdirSync(sourceIncidents, { withFileTypes: true }).filter((entry) => entry.isDirectory())) {
    const from = path.join(sourceIncidents, incident.name)
    const to = path.join(destination, 'incidentes', incident.name)
    fs.mkdirSync(to, { recursive: true })
    for (const name of fs.readdirSync(from)) {
      const sourceFile = path.join(from, name)
      const destinationFile = path.join(to, name)
      if (!fs.statSync(sourceFile).isFile() || fs.existsSync(destinationFile)) continue
      fs.copyFileSync(sourceFile, destinationFile)
      copied.push(path.relative(destination, destinationFile))
    }
  }
}
if (!copied.length) {
  process.stderr.write(JSON.stringify({ passed: false, failures: ['nenhuma evidencia nova para publicar: a branch de auditoria e append-only'] }) + '\n')
  process.exit(1)
}
if (input.push) {
  const relative = path.relative(archiveRoot, destination)
  const add = run('git', ['add', '--', relative], archiveRoot)
  const commit = add.status === 0 ? run('git', ['commit', '-m', 'audit(kora): relato sanitizado ' + round], archiveRoot) : add
  const push = commit.status === 0 ? run('git', ['push', 'origin', 'audit/kora'], archiveRoot) : commit
  if (push.status !== 0) {
    process.stderr.write(JSON.stringify({ passed: false, failures: ['nao foi possivel publicar na branch audit/kora'], copied: relative }) + '\n')
    process.exit(1)
  }
}
process.stdout.write(JSON.stringify({ passed: true, round, branch, published: input.push === true, initialPublication, copied, destination: path.relative(archiveRoot, destination) }) + '\n')
