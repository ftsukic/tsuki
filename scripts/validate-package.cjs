const { execFileSync } = require('node:child_process')
const fs = require('node:fs')

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const forbiddenInstallScripts = ['preinstall', 'install', 'postinstall']
const invalidInstallScripts = forbiddenInstallScripts.filter((name) => packageJson.scripts?.[name])

if (invalidInstallScripts.length > 0) {
  throw new Error(
    `Published package must not define consumer install scripts: ${invalidInstallScripts.join(
      ', ',
    )}`,
  )
}

const output = execFileSync('npm', ['pack', '--dry-run', '--json'], {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'inherit'],
})
const packResult = JSON.parse(output)[0]
const files = packResult.files.map(({ path }) => path.replaceAll('\\', '/'))
const requiredFiles = [
  'package.json',
  'README.md',
  'LICENSE',
  'lib/commonjs/index.js',
  'lib/module/index.js',
  'lib/typescript/commonjs/index.d.ts',
  'lib/typescript/module/index.d.ts',
  'src/index.ts',
]
const forbiddenPatterns = [
  /(^|\/)__tests__(\/|$)/,
  /(^|\/)__fixtures__(\/|$)/,
  /(^|\/)__mocks__(\/|$)/,
  /(^|\/)\.vscode(\/|$)/,
  /(^|\/)docs(\/|$)/,
  /(^|\/)docs-dist(\/|$)/,
  /(^|\/)example(\/|$)/,
]
const missingFiles = requiredFiles.filter((file) => !files.includes(file))
const forbiddenFiles = files.filter((file) =>
  forbiddenPatterns.some((pattern) => pattern.test(file)),
)

if (packResult.name !== packageJson.name) {
  throw new Error(`Packed package name does not match package.json: ${packResult.name}`)
}

if (packResult.version !== packageJson.version) {
  throw new Error(`Packed package version does not match package.json: ${packResult.version}`)
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
