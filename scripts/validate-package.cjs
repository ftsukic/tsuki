const { execSync } = require('node:child_process')
const fs = require('node:fs')
const path = require('node:path')

const packageDirectory = path.resolve(__dirname, '..', 'packages', 'tsuki')
const packageJson = JSON.parse(fs.readFileSync(path.join(packageDirectory, 'package.json'), 'utf8'))
const forbiddenInstallScripts = ['preinstall', 'install', 'postinstall']
const invalidInstallScripts = forbiddenInstallScripts.filter((name) => packageJson.scripts?.[name])
const requiredExportTargets = [
  ['.', ['import', 'types'], './dist/typescript/module/index.d.ts'],
  ['.', ['import', 'default'], './dist/module/index.js'],
  ['.', ['react-native', 'types'], './dist/typescript/module/index.d.ts'],
  ['.', ['react-native', 'default'], './dist/module/index.js'],
  ['.', ['require', 'types'], './dist/typescript/commonjs/index.d.ts'],
  ['.', ['require', 'default'], './dist/commonjs/index.js'],
  ['./theme.css', [], './dist/theme/theme.css'],
  ['./nativewind-v4-preset', ['require'], './dist/theme/nativewind-v4-preset.cjs'],
  ['./nativewind-v4-preset', ['default'], './dist/theme/nativewind-v4-preset.cjs'],
  ['./nativewind-v5.css', [], './dist/theme/nativewind-v5.css'],
]

if (invalidInstallScripts.length > 0) {
  throw new Error(
    `Published package must not define consumer install scripts: ${invalidInstallScripts.join(
      ', ',
    )}`,
  )
}

for (const [subpath, conditions, expected] of requiredExportTargets) {
  let actual = packageJson.exports?.[subpath]
  for (const condition of conditions) actual = actual?.[condition]
  if (actual !== expected) {
    const conditionLabel = conditions.length ? ' (' + conditions.join(', ') + ')' : ''
    throw new Error('Package export ' + subpath + conditionLabel + ' must target ' + expected)
  }
}

const output = execSync('npm pack --dry-run --json --ignore-scripts', {
  cwd: packageDirectory,
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
})
const packResult = JSON.parse(output)[0]
const files = packResult.files.map(({ path }) => path.replaceAll('\\', '/'))
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'dist/commonjs/index.js',
  'dist/module/index.js',
  'dist/typescript/commonjs/index.d.ts',
  'dist/typescript/module/index.d.ts',
]
const forbiddenPatterns = [
  /(^|\/)(bak|lib|src)(\/|$)/,
  /(^|\/)__tests__(\/|$)/,
  /(^|\/)__fixtures__(\/|$)/,
  /(^|\/)__mocks__(\/|$)/,
  /(^|\/)\.vscode(\/|$)/,
  /(^|\/)docs(\/|$)/,
  /(^|\/)docs-dist(\/|$)/,
  /(^|\/)(apps|playground|example)(\/|$)/,
]
function collectExportFiles(value) {
  if (typeof value === 'string') return [value.replace(/^\.\//, '')]
  if (!value || typeof value !== 'object') return []
  return Object.values(value).flatMap(collectExportFiles)
}

const requiredPackageFiles = [
  ...new Set([...requiredFiles, ...collectExportFiles(packageJson.exports)]),
]
const missingFiles = requiredPackageFiles.filter((file) => !files.includes(file))
const forbiddenFiles = files.filter((file) =>
  forbiddenPatterns.some((pattern) => pattern.test(file)),
)

if (packResult.name !== '@ftsukic/tsuki') {
  throw new Error('Refusing to validate unexpected package: ' + packResult.name)
}

if (packResult.name !== packageJson.name) {
  throw new Error(`Packed package name does not match package.json: ${packResult.name}`)
}

if (packResult.version !== packageJson.version) {
  throw new Error(`Packed package version does not match package.json: ${packResult.version}`)
}

if (packageJson['react-native-builder-bob']?.source !== 'src') {
  throw new Error('Bob must build the active v2 source directory: src')
}

if (packageJson['react-native-builder-bob']?.output !== 'dist') {
  throw new Error('Bob output must remain isolated in dist')
}

if (packageJson.sideEffects?.includes('**/*.css') !== true) {
  throw new Error('CSS files must be declared as package side effects')
}

if (packageJson.peerDependencies?.['react-native-teleport']) {
  throw new Error('react-native-teleport must not be a v2 runtime peer dependency')
}

const runtimePackages = Object.keys(packageJson.dependencies ?? {}).concat(
  Object.keys(packageJson.peerDependencies ?? {}),
)
if (runtimePackages.some((name) => /^(nativewind|tailwindcss|react-native-css)$/.test(name))) {
  throw new Error('NativeWind, Tailwind, and react-native-css must stay in consumer apps')
}

if (missingFiles.length > 0) {
  throw new Error(`Missing package files: ${missingFiles.join(', ')}`)
}

console.log(`name: ${packResult.name}`)
console.log(`version: ${packResult.version}`)
console.log(`total file count: ${files.length}`)
console.log(`unpacked size: ${packResult.unpackedSize}`)
console.log(`forbidden file count: ${forbiddenFiles.length}`)

if (forbiddenFiles.length > 0) {
  throw new Error(`Forbidden package files: ${forbiddenFiles.join(', ')}`)
}
