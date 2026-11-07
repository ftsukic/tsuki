import fs from 'node:fs'
import path from 'node:path'
import { resolve as resolveMetro } from 'metro-resolver'
import ts from 'typescript'

function resolveSource(
  originModulePath: string,
  specifier: string,
  platform: string,
  options: { packageExports?: boolean; packageRoot?: string } = {},
) {
  const packageJsonPath = options.packageRoot
    ? path.join(options.packageRoot, 'package.json')
    : undefined
  const packageJson = packageJsonPath
    ? JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    : undefined
  const fileSystemLookup = (candidate: string) => {
    try {
      const stats = fs.statSync(candidate)
      return {
        exists: true as const,
        type: stats.isDirectory() ? ('d' as const) : ('f' as const),
        realPath: fs.realpathSync(candidate),
      }
    } catch {
      return { exists: false as const }
    }
  }
  const resolution = resolveMetro(
    {
      allowHaste: false,
      assetExts: new Set(),
      customResolverOptions: {},
      disableHierarchicalLookup: true,
      doesFileExist: fs.existsSync,
      extraNodeModules: options.packageRoot ? { '@ftsukic/tsuki': options.packageRoot } : null,
      dev: true,
      getPackage: (candidate) => (candidate === packageJsonPath ? packageJson : null),
      getPackageForModule: (candidate) => {
        if (!options.packageRoot || !packageJson) return null
        const relativePath = path.relative(options.packageRoot, candidate)
        if (relativePath === '..' || relativePath.startsWith(`..${path.sep}`)) return null
        return {
          packageJson,
          packageRelativePath: relativePath.split(path.sep).join('/'),
          rootPath: options.packageRoot,
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
      unstable_enablePackageExports: options.packageExports ?? false,
      unstable_incrementalResolution: false,
      unstable_logWarning: () => {},
    },
    specifier,
    platform,
  )
  if (resolution.type !== 'sourceFile') {
    throw new Error(`Metro did not resolve ${specifier} from ${originModulePath}`)
  }
  return resolution.filePath
}

// Follow runtime imports using Metro's platform-specific source resolution.
function dependencies(entry: string, platform: string, visited = new Set<string>()) {
  if (visited.has(entry)) return visited
  visited.add(entry)
  const source = ts.createSourceFile(entry, fs.readFileSync(entry, 'utf8'), ts.ScriptTarget.Latest)
  function visit(node: ts.Node) {
    let specifier: string | undefined
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
      dependencies(resolveSource(entry, specifier, platform), platform, visited)
    } else if (specifier) {
      visited.add(specifier)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return visited
}

it('resolves platform defaults and keeps Harmony on the JS dependency graph', () => {
  const sourceEntry = path.resolve(__dirname, '../index.ts')
  const backendProvider = path.resolve(__dirname, '../portal/backend-provider.tsx')

  for (const platform of ['ios', 'android', 'web']) {
    expect(resolveSource(backendProvider, './default-backend', platform)).toBe(
      path.resolve(__dirname, `../portal/default-backend.${platform}.ts`),
    )
    const graph = dependencies(sourceEntry, platform)
    expect(graph.has('react-native-teleport')).toBe(true)
    expect(graph.has(path.resolve(__dirname, '../text/text.tsx'))).toBe(true)
    expect(graph.has('tailwind-merge')).toBe(true)
  }

  for (const platform of ['harmony', 'windows']) {
    expect(resolveSource(backendProvider, './default-backend', platform)).toBe(
      path.resolve(__dirname, '../portal/default-backend.ts'),
    )
    const graph = dependencies(sourceEntry, platform)
    expect(graph.has('react-native-teleport')).toBe(false)
    expect(graph.has(path.resolve(__dirname, '../text/text.tsx'))).toBe(true)
    expect(graph.has('tailwind-merge')).toBe(true)
  }

  expect(
    dependencies(path.resolve(__dirname, '../teleport.ts'), 'ios').has('react-native-teleport'),
  ).toBe(true)
})

it('resolves the actual package root through exports on React Native platforms', () => {
  const packageRoot = path.resolve(__dirname, '../..')
  const consumerEntry = path.resolve(packageRoot, 'example/app/_layout.tsx')

  for (const platform of ['ios', 'android', 'harmony']) {
    expect(
      resolveSource(consumerEntry, '@ftsukic/tsuki', platform, {
        packageExports: true,
        packageRoot,
      }),
    ).toBe(path.resolve(packageRoot, 'src/index.ts'))
  }
})
