const { execFileSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { entries } = require('../apps/playground/fixtures/manifest.json')

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
  const fixturePackageRoot = path.join(repositoryRoot, 'packages', 'consumer-fixtures')
  const stagedFixturePackageRoot = path.join(consumerRoot, 'consumer-fixtures')
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

  fs.cpSync(fixturePackageRoot, stagedFixturePackageRoot, {
    recursive: true,
    filter(sourcePath) {
      const relativePath = path.relative(fixturePackageRoot, sourcePath)
      const segments = relativePath.split(path.sep)
      return (
        !segments.includes('__tests__') &&
        !segments.some((segment) => excludedDirectories.has(segment))
      )
    },
  })

  const tsukiPackageJson = JSON.parse(
    fs.readFileSync(path.join(packageRoot, 'package.json'), 'utf8'),
  )
  const stagedFixtureManifestPath = path.join(stagedFixturePackageRoot, 'package.json')
  const stagedFixtureManifest = JSON.parse(fs.readFileSync(stagedFixtureManifestPath, 'utf8'))
  stagedFixtureManifest.peerDependencies['@ftsukic/tsuki'] = `^${tsukiPackageJson.version}`
  fs.writeFileSync(stagedFixtureManifestPath, JSON.stringify(stagedFixtureManifest, null, 2) + '\n')

  const packageJsonPath = path.join(consumerRoot, 'package.json')
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
  const relativeTarball = path.relative(consumerRoot, tarballPath).split(path.sep).join('/')
  packageJson.dependencies['@ftsukic/tsuki'] = 'file:' + relativeTarball
  packageJson.dependencies['@ftsukic/consumer-fixtures'] = 'file:./consumer-fixtures'
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n')

  const tsconfigPath = path.join(consumerRoot, 'tsconfig.json')
  const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath, 'utf8'))
  if (tsconfig.compilerOptions) delete tsconfig.compilerOptions.paths
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2) + '\n')

  stageCanonicalExamples(consumerRoot, name === 'playground-nw4')
  return consumerRoot
}

function stageCanonicalExamples(consumerRoot, isV4) {
  const fixtures = entries.filter((entry) => entry.version === 'v2')
  const imports = fixtures.map(({ component, fixturePath }, index) => {
    fs.cpSync(
      path.dirname(path.join(repositoryRoot, fixturePath)),
      path.join(consumerRoot, 'src/fixtures', component),
      { recursive: true },
    )
    return 'import Preview' + index + " from './src/fixtures/" + component + "/overview'"
  })
  const previews = fixtures.map(
    ({ title }, index) => '[' + JSON.stringify(title) + ', Preview' + index + ']',
  )
  if (!isV4) {
    fs.appendFileSync(path.join(consumerRoot, 'global.css'), "\n@source './src/fixtures';\n")
  }
  fs.renameSync(path.join(consumerRoot, 'App.tsx'), path.join(consumerRoot, 'SmokeApp.tsx'))
  const app = [
    "import { useState } from 'react'",
    "import { Button, TsukiProvider, useTsukiTheme } from '@ftsukic/tsuki'",
    "import type { ThemeScopeRenderer } from '@ftsukic/tsuki'",
    "import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'",
    isV4
      ? "import { vars } from 'nativewind'"
      : "import { VariableContextProvider } from 'nativewind'",
    "import SmokeApp from './SmokeApp'",
    ...imports,
    'const previews = [' + previews.join(', ') + '] as const',
    isV4
      ? 'const renderThemeScope: ThemeScopeRenderer = ({ variables, kind, children }) => <View pointerEvents={kind === "overlay" ? "box-none" : undefined} style={[kind === "root" ? { flex: 1 } : kind === "overlay" ? StyleSheet.absoluteFill : undefined, vars(variables)]}>{children}</View>'
      : 'const renderThemeScope: ThemeScopeRenderer = ({ variables, children }) => <VariableContextProvider value={variables}>{children}</VariableContextProvider>',
    'function Examples() {',
    '  const [selected, select] = useState<number | null>(null)',
    '  const theme = useTsukiTheme()',
    '  const Preview = selected === null ? null : previews[selected][1]',
    '  const content = Preview ? <View style={{flex: 1}}><Button onPress={() => select(null)}>All examples</Button><Preview /></View> : (',
    '    <ScrollView contentContainerStyle={{gap: 12, padding: 16}}>',
    '      {previews.map(([name], index) => <Button key={name} onPress={() => select(index)}>{name}</Button>)}',
    '    </ScrollView>',
    '  )',
    '  return <View style={{flex: 1, backgroundColor: theme.semantic.colorBackground}}>{content}</View>',
    '}',
    'export default function App() {',
    '  const [showExamples, setShowExamples] = useState(false)',
    '  const [dark, setDark] = useState(false)',
    '  return <View style={{ flex: 1 }}>',
    '    <Pressable style={{paddingTop: 48, paddingHorizontal: 16}} onPress={() => setShowExamples(!showExamples)}><Text>{showExamples ? "Consumer smoke" : "Canonical examples"}</Text></Pressable>',
    '    {showExamples ? <><Pressable style={{padding: 16}} onPress={() => setDark(!dark)}><Text>{dark ? "Light" : "Dark"}</Text></Pressable><TsukiProvider renderThemeScope={renderThemeScope} scheme={dark ? "dark" : "light"}><Examples /></TsukiProvider></> : <SmokeApp />}',
    '  </View>',
    '}',
    '',
  ].join('\n')
  fs.writeFileSync(path.join(consumerRoot, 'App.tsx'), app)
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

  for (const consumerName of ['playground-nw4', 'playground-nw5']) {
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
