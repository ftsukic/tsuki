const assert = require('node:assert/strict')
const { execFileSync } = require('node:child_process')
const { mkdtempSync, rmSync, rmdirSync } = require('node:fs')
const { tmpdir } = require('node:os')
const path = require('node:path')

const directory = path.resolve(__dirname, '../packages/tsuki-native')
const manifest = require(path.join(directory, 'package.json'))
const { TypeScriptParser } = require(
  require.resolve('@react-native/codegen/lib/parsers/typescript/parser', { paths: [directory] }),
)

const { codegenConfig, exports: entryPoints } = manifest
assert.deepEqual(codegenConfig, {
  name: 'TsukiNativeSpec',
  type: 'components',
  jsSrcsDir: 'src',
  android: { javaPackageName: 'com.ftsukic.tsukinative' },
  ios: { components: { TsukiSelectableText: { className: 'TsukiSelectableTextComponentView' } } },
})

const spec = 'src/selectable-text/SelectableTextNativeComponent.ts'
const schema = new TypeScriptParser().parseFile(path.join(directory, spec))
const component = schema.modules.TsukiSelectableText.components.TsukiSelectableText
assert.ok(
  component.props.some(
    (prop) =>
      prop.name === 'text' && !prop.optional && prop.typeAnnotation.type === 'StringTypeAnnotation',
  ),
)

const sizeEvent = component.events.find((event) => event.name === 'onContentSizeChange')
assert.equal(sizeEvent?.bubblingType, 'direct')
assert.deepEqual(
  sizeEvent.typeAnnotation.argument.properties.map((prop) => [prop.name, prop.typeAnnotation.type]),
  [
    ['width', 'FloatTypeAnnotation'],
    ['height', 'FloatTypeAnnotation'],
  ],
)

const required = [
  'package.json',
  'README.md',
  'LICENSE',
  'TsukiNative.podspec',
  'ios/selectable-text/TsukiSelectableTextComponentView.h',
  'ios/selectable-text/TsukiSelectableTextComponentView.mm',
  'android/build.gradle',
  'android/src/main/AndroidManifest.xml',
  'android/src/main/java/com/ftsukic/tsukinative/TsukiNativePackage.kt',
  'android/src/main/java/com/ftsukic/tsukinative/selectabletext/TsukiSelectableTextManager.kt',
  'android/src/main/java/com/ftsukic/tsukinative/selectabletext/TsukiSelectableTextView.kt',
  spec,
]

assert.deepEqual(Object.keys(entryPoints), ['.', './selectable-text'])
for (const conditions of Object.values(entryPoints)) {
  assert.deepEqual(Object.keys(conditions), ['react-native', 'import', 'require'])
  for (const { types, default: runtime } of Object.values(conditions)) {
    required.push(types.slice(2), runtime.slice(2))
  }
}

function pack(args, destination) {
  const npmArgs = ['pack', '--json', ...args]
  const options = {
    cwd: directory,
    encoding: 'utf8',
    env: { ...process.env, npm_config_pack_destination: destination ?? directory },
  }
  return JSON.parse(
    process.platform === 'win32'
      ? execFileSync('cmd.exe', ['/d', '/c', 'npm', ...npmArgs], options)
      : execFileSync('npm', npmArgs, options),
  )[0]
}

const dryRun = pack(['--dry-run'])
assert.equal(dryRun.name, manifest.name)
assert.equal(dryRun.version, manifest.version)

const temporary = mkdtempSync(path.join(tmpdir(), 'tsuki-native-'))
try {
  const packed = pack([], temporary)
  const archive = path.join(temporary, packed.filename)
  const entries = new Set(
    execFileSync('tar', ['-tf', archive], { encoding: 'utf8' }).trim().split(/\r?\n/u),
  )
  for (const file of new Set(required)) {
    assert.ok(
      dryRun.files.some((entry) => entry.path === file),
      `Missing from npm dry run: ${file}`,
    )
    assert.ok(entries.has(`package/${file}`), `Missing from tarball: ${file}`)
  }
  console.log([...entries].sort().join('\n'))
} finally {
  rmSync(path.join(temporary, 'ftsukic-tsuki-native-' + manifest.version + '.tgz'), { force: true })
  rmdirSync(temporary)
}
