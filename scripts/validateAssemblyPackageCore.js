const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

const ROUND_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const SHA256 = /^[a-f0-9]{64}$/

function hashFile(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function parseTopologyMetadata(content) {
  const frontmatter = content.match(/^---\n([\s\S]*?)\n---/)
  const fields = {}
  for (const line of (frontmatter?.[1] ?? '').split('\n')) {
    const match = line.match(/^([A-Za-z][A-Za-z0-9]*):\s*(.*?)\s*$/)
    if (match) fields[match[1]] = match[2]
  }
  return fields
}

function parseTopologyStatus(content) { return parseTopologyMetadata(content).status ?? null }

function validArtifact(artifact, label, round, repositoryRoot, seenPaths, failures) {
  if (!artifact?.id || !artifact?.caminho || !SHA256.test(artifact?.sha256 ?? '')) {
    failures.push(`${label} precisa ter id, caminho e sha256 valido`)
    return
  }
  const expectedPrefix = `.designops/runs/${round}/`
  if (!artifact.caminho.startsWith(expectedPrefix)) {
    failures.push(`${label} precisa permanecer isolado em ${expectedPrefix}`)
    return
  }
  if (path.isAbsolute(artifact.caminho)) {
    failures.push(`${label} nao pode usar caminho absoluto`)
    return
  }
  const absolute = path.resolve(repositoryRoot, artifact.caminho)
  const relative = path.relative(repositoryRoot, absolute)
  const normalized = relative.split(path.sep).join('/')
  if (relative === '..' || relative.startsWith('..' + path.sep) || !normalized.startsWith(expectedPrefix) || !fs.existsSync(absolute) || !fs.statSync(absolute).isFile()) {
    failures.push(`${label} nao aponta para arquivo existente na worktree`)
    return
  }
  if (seenPaths.has(artifact.caminho)) failures.push(`${label} repete evidencia: ${artifact.caminho}`)
  seenPaths.add(artifact.caminho)
  if (hashFile(absolute) !== artifact.sha256) failures.push(`${label} diverge do sha256 registrado: ${artifact.caminho}`)
  try {
    const embeddedRound = JSON.parse(fs.readFileSync(absolute, 'utf8')).rodada ?? JSON.parse(fs.readFileSync(absolute, 'utf8')).roundId
    if (embeddedRound !== undefined && embeddedRound !== round) failures.push(`${label} declara outra rodada: ${embeddedRound}`)
  } catch {
    // Relatorios MCP podem ser texto literal; o caminho e hash continuam a prova obrigatoria.
  }
}

function validateAssemblyPackageData(data, options = {}) {
  const failures = []
  const round = options.round ?? data?.rodada
  const repositoryRoot = options.repositoryRoot
  if (!ROUND_ID.test(round ?? '')) failures.push('rodada invalida')
  if (data?.schemaVersion !== 1) failures.push('schemaVersion precisa ser 1')
  if (data?.rodada !== round) failures.push('pacote pertence a outra rodada')
  if (data?.estado !== 'CONCLUIDA_PARA_VALIDACAO') failures.push('pacote nao esta concluido para validacao')
  if (!repositoryRoot) {
    failures.push('worktree obrigatoria para verificar o pacote de montagem')
    return failures
  }

  const topology = data?.topologia
  const topologyFile = path.join(repositoryRoot, 'docs', 'topologia-biblioteca.md')
  if (topology?.arquivo !== 'docs/topologia-biblioteca.md' || !SHA256.test(topology?.sha256 ?? '')) {
    failures.push('topologia sem arquivo ou hash verificavel')
  } else if (!fs.existsSync(topologyFile)) {
    failures.push('documento de topologia ausente')
  } else {
    const metadata = parseTopologyMetadata(fs.readFileSync(topologyFile, 'utf8'))
    if (metadata.status !== 'APROVADO') failures.push('topologia da biblioteca ainda nao esta APROVADA')
    if (metadata.status === 'APROVADO' && (!['A', 'B', 'C'].includes(metadata.alternativa) || !metadata.aprovadoPor || metadata.aprovadoPor === 'null' || Number.isNaN(Date.parse(metadata.aprovadoEm ?? '')))) {
      failures.push('topologia APROVADA exige alternativa, aprovador e data')
    }
    if (hashFile(topologyFile) !== topology.sha256) failures.push('hash da topologia diverge do documento aprovado')
  }

  const area = data?.areaVerificacao
  if (!area?.nome || !/^_verificacao-[a-z0-9-]+$/.test(area.nome) || area.confirmada !== true) failures.push('area de verificacao nao esta confirmada em _verificacao-<etapa>')
  const seenPaths = new Set()
  validArtifact(area?.evidencia, 'evidencia da area de verificacao', round, repositoryRoot, seenPaths, failures)

  const groups = [
    ['rascunhos', data?.rascunhos],
    ['previews', data?.previews],
    ['evidencias MCP', data?.evidenciasMcp],
  ]
  for (const [label, artifacts] of groups) {
    if (!Array.isArray(artifacts) || artifacts.length === 0) {
      failures.push(`${label} exige ao menos uma prova`)
      continue
    }
    artifacts.forEach((artifact, index) => validArtifact(artifact, `${label}[${index}]`, round, repositoryRoot, seenPaths, failures))
  }
  validArtifact(data?.componentesLocais, 'plano de componentes locais', round, repositoryRoot, seenPaths, failures)
  validArtifact(data?.planoVariaveis, 'plano de variaveis aplicado', round, repositoryRoot, seenPaths, failures)
  return failures
}

module.exports = { hashFile, parseTopologyMetadata, parseTopologyStatus, validateAssemblyPackageData }
