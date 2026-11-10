const { execFileSync } = require('node:child_process')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const { resolve: resolveMetro } = require('metro-resolver')
const ts = require('typescript')

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const packageRoot = process.cwd()
const packageJsonPath = path.join(packageRoot, 'package.json')
const forbiddenInstallScripts = ['preinstall', 'install', 'postinstall']
const invalidInstallScripts = forbiddenInstallScripts.filter((name) => packageJson.scripts?.[name])

if (invalidInstallScripts.length > 0) {
  throw new Error(
    `Published package must not define consumer install scripts: ${invalidInstallScripts.join(
      ', ',
    )}`,
  )
}

const output = execFileSync(
  'npm',
  ['pack', '--dry-run', '--json', '--ignore-scripts', '--silent'],
  {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'inherit'],
  },
)
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
  'src/teleport.ts',
  'lib/commonjs/teleport.js',
  'lib/module/teleport.js',
  'lib/typescript/commonjs/teleport.d.ts',
  'lib/typescript/module/teleport.d.ts',
  ...['commonjs', 'module'].flatMap((target) =>
    ['default', 'ios', 'android', 'web'].map(
      (platform) =>
        `lib/${target}/portal/default-backend${platform === 'default' ? '' : `.${platform}`}.js`,
    ),
  ),
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

function fileSystemLookup(candidate) {
  try {
    const stats = fs.statSync(candidate)
    return {
      exists: true,
      type: stats.isDirectory() ? 'd' : 'f',
      realPath: fs.realpathSync(candidate),
    }
  } catch {
    return { exists: false }
  }
}

function createResolverContext(
  originModulePath,
  { packageExports = false, isESMImport = true } = {},
) {
  return {
    allowHaste: false,
    assetExts: new Set(),
    customResolverOptions: {},
    disableHierarchicalLookup: true,
    doesFileExist: fs.existsSync,
    extraNodeModules: packageExports ? { '@ftsukic/tsuki': packageRoot } : null,
    dev: false,
    getPackage: (candidate) => (candidate === packageJsonPath ? packageJson : null),
    getPackageForModule: (candidate) => {
      const relativePath = path.relative(packageRoot, candidate)
      if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`)) return null
      return {
        packageJson,
        packageRelativePath: relativePath.split(path.sep).join('/'),
        rootPath: packageRoot,
      }
    },
    fileSystemLookup,
    mainFields: ['react-native', 'browser', 'main'],
    originModulePath,
    nodeModulesPaths: [],
    preferNativePlatform: true,
    resolveAsset: () => null,
    redirectModulePath: (modulePath) => modulePath,
    resolveHasteModule: () => null,
    resolveHastePackage: () => null,
    sourceExts: ['js', 'jsx', 'ts', 'tsx'],
    unstable_conditionNames: [],
    unstable_conditionsByPlatform: {
      android: ['react-native'],
      harmony: ['react-native'],
      ios: ['react-native'],
      web: ['browser'],
    },
    unstable_enablePackageExports: packageExports,
    unstable_incrementalResolution: false,
    unstable_logWarning: () => {},
    isESMImport,
  }
}

function resolveModule(originModulePath, specifier, platform, options) {
  const resolution = resolveMetro(
    createResolverContext(originModulePath, options),
    specifier,
    platform,
  )
  assert.equal(resolution.type, 'sourceFile', `Metro did not resolve ${specifier} for ${platform}`)
  return resolution.filePath
}

function dependencies(entry, platform, visited = new Set()) {
  if (visited.has(entry)) return visited
  visited.add(entry)
  const source = ts.createSourceFile(entry, fs.readFileSync(entry, 'utf8'), ts.ScriptTarget.Latest)
  function visit(node) {
    let specifier
    if (
      (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly) ||
      (ts.isExportDeclaration(node) && !node.isTypeOnly)
    ) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifier = node.moduleSpecifier.text
      }
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'require' &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifier = node.arguments[0].text
    }
    if (specifier?.startsWith('.')) {
      const resolved = resolveModule(entry, specifier, platform)
      dependencies(resolved, platform, visited)
    } else if (specifier) {
      visited.add(specifier)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return visited
}

function validatePublishedPortalResolution() {
  const consumerEntry = path.join(packageRoot, 'example/app/_layout.tsx')
  for (const platform of ['ios', 'android', 'harmony']) {
    assert.equal(
      resolveModule(consumerEntry, '@ftsukic/tsuki', platform, {
        packageExports: true,
      }),
      path.join(packageRoot, 'src/index.ts'),
      `Package exports must select the shared React Native entry for ${platform}`,
    )
  }
  assert.equal(
    resolveModule(consumerEntry, '@ftsukic/tsuki', 'web', {
      packageExports: true,
      isESMImport: true,
    }),
    path.join(packageRoot, 'lib/module/index.js'),
    'Package exports must resolve the ESM web entry',
  )
  assert.equal(
    resolveModule(consumerEntry, '@ftsukic/tsuki', 'web', {
      packageExports: true,
      isESMImport: false,
    }),
    path.join(packageRoot, 'lib/commonjs/index.js'),
    'Package exports must resolve the CommonJS web entry',
  )

  for (const target of ['commonjs', 'module']) {
    const entry = path.join(packageRoot, `lib/${target}/index.js`)
    for (const platform of ['ios', 'android', 'web', 'harmony']) {
      const graph = dependencies(entry, platform)
      assert.equal(
        graph.has('tailwind-merge'),
        true,
        `${target} dependency graph must include the Text class merge dependency for ${platform}`,
      )
      assert.equal(
        graph.has('react-native-teleport'),
        platform !== 'harmony',
        `${target} dependency graph has an unexpected Teleport dependency for ${platform}`,
      )
      assert.equal(
        resolveModule(
          path.join(packageRoot, `lib/${target}/portal/backend-provider.js`),
          './default-backend',
          platform,
        ),
        path.join(
          packageRoot,
          `lib/${target}/portal/default-backend${
            ['ios', 'android', 'web'].includes(platform) ? `.${platform}` : ''
          }.js`,
        ),
        `${target} backend relative import resolved incorrectly for ${platform}`,
      )
    }
  }
}

if (packResult.name !== packageJson.name) {
  throw new Error(`Packed package name does not match package.json: ${packResult.name}`)
}

if (packResult.version !== packageJson.version) {
  throw new Error(`Packed package version does not match package.json: ${packResult.version}`)
}

if (missingFiles.length > 0) {
  throw new Error(`Missing package files: ${missingFiles.join(', ')}`)
}

validatePublishedPortalResolution()

console.log(`name: ${packResult.name}`)
console.log(`version: ${packResult.version}`)
console.log(`total file count: ${files.length}`)
console.log(`unpacked size: ${packResult.unpackedSize}`)
console.log(`forbidden file count: ${forbiddenFiles.length}`)

if (forbiddenFiles.length > 0) {
  throw new Error(`Forbidden package files: ${forbiddenFiles.join(', ')}`)
}
