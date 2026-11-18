const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

const repositoryRoot = path.resolve(__dirname, '..')
const packageRoot = path.join(repositoryRoot, 'packages', 'tsuki')
const tempParent = path.resolve(os.tmpdir())
const tempRoot = fs.mkdtempSync(path.join(tempParent, 'tsuki-v2-tarball-'))
const useWindowsShell = process.platform === 'win32'

function run(command, args, cwd, options = {}) {
  execFileSync(command, args, {
    cwd,
    stdio: 'inherit',
    shell: useWindowsShell,
    ...options,
  })
}

function rewriteConsumerForTarball(name, tarballPath) {
  const sourceRoot = path.join(repositoryRoot, 'apps', name)
  const consumerRoot = path.join(tempRoot, name)
  const excludedDirectories = new Set(['node_modules', '.expo', '.turbo', 'ios', 'android'])

  fs.cpSync(sourceRoot, consumerRoot, {
    recursive: true,
    filter(sourcePath) {
      const relativePath = path.relative(sourceRoot, sourcePath)
      const segments = relativePath.split(path.sep)
      return (
        path.basename(sourcePath) !== 'AGENTS.md' &&
        !segments.some((segment) => excludedDirectories.has(segment))
      )
    },
  })

  const packageJsonPath = path.join(consumerRoot, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const relativeTarball = path.relative(consumerRoot, tarballPath).split(path.sep).join('/')
  packageJson.dependencies['@ftsukic/tsuki'] = 'file:' + relativeTarball
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  const tsconfigPath = path.join(consumerRoot, 'tsconfig.json')
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
  if (tsconfig.compilerOptions) delete tsconfig.compilerOptions.paths
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n')

  for (const fileName of ['global.css', 'tailwind.config.js']) {
    const filePath = path.join(consumerRoot, fileName)
    if (!fs.existsSync(filePath)) continue
    const contents = fs.readFileSync(filePath, 'utf8')
    fs.writeFileSync(
      filePath,
      contents.replaceAll('../../node_modules/@ftsukic/tsuki', './node_modules/@ftsukic/tsuki'),
    )
  }

  return consumerRoot
}

function createTarball() {
  const output = execFileSync(
    'npm',
    ['pack', '--pack-destination', tempRoot, '--json', '--ignore-scripts'],
    {
      cwd: packageRoot,
      encoding: 'utf8',
      maxBuffer: 10 * 1024 * 1024,
      shell: useWindowsShell,
      stdio: ['ignore', 'pipe', 'inherit'],
    },
  )
  const result = JSON.parse(output)[0]
  if (result.name !== '@ftsukic/tsuki') {
    throw new Error('Refusing to install an unexpected tarball: ' + result.name)
  }
  return path.join(tempRoot, result.filename)
}

try {
  const tarballPath = createTarball()

  for (const consumerName of ['nativewind-v4-consumer', 'nativewind-v5-consumer']) {
    const consumerRoot = rewriteConsumerForTarball(consumerName, tarballPath)
    console.log('\nVerifying packed package in ' + consumerName)
    run('npm', ['install', '--no-audit', '--no-fund'], consumerRoot)
    run('npm', ['run', 'typecheck'], consumerRoot)
    run('npm', ['run', 'config'], consumerRoot)
    run('npm', ['run', 'build:development'], consumerRoot)
  }

  if (path.dirname(tempRoot) !== tempParent) {
    throw new Error('Refusing to remove a temporary directory outside the system temp folder.')
  }
  fs.rmSync(tempRoot, { recursive: true, force: true })
  console.log('Both npm tarball consumers typechecked and bundled for iOS and Android.')
} catch (error) {
  console.error('Tarball consumer check failed. Temporary projects are at ' + tempRoot)
  throw error
}
