const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const packageRoot = path.resolve(__dirname, '..', 'packages', 'tsuki')
const sourceRoot = path.join(packageRoot, 'src', 'theme')
const outputRoot = path.join(packageRoot, 'dist', 'theme')
const sourceThemePath = path.join(sourceRoot, 'theme.css')
const assets = ['theme.css', 'nativewind-v4-preset.cjs', 'nativewind-v5.css']

const typescript = require(require.resolve('typescript', { paths: [packageRoot] }))

function loadTypeScriptModule(filePath) {
  const source = fs.readFileSync(filePath, 'utf8')
  const { outputText } = typescript.transpileModule(source, {
    compilerOptions: {
      module: typescript.ModuleKind.CommonJS,
      target: typescript.ScriptTarget.ES2022,
    },
  })
  const loadedModule = { exports: {} }
  vm.runInNewContext(outputText, {
    exports: loadedModule.exports,
    module: loadedModule,
    require: (name) => {
      // Static CSS uses a one-CSS-pixel fallback. React Native resolves the
      // actual device hairline before serializing runtime theme variables.
      if (name === 'react-native') return { StyleSheet: { hairlineWidth: 1 } }
      return require(name)
    },
  })
  return loadedModule.exports
}

function createThemeCss() {
  const { getDefaultTheme } = loadTypeScriptModule(path.join(sourceRoot, 'defaults.ts'))
  const { serializeTheme } = loadTypeScriptModule(path.join(sourceRoot, 'serialize-theme.ts'))
  const lightVariables = serializeTheme(getDefaultTheme('light'))
  const darkVariables = serializeTheme(getDefaultTheme('dark'))
  const lightKeys = Object.keys(lightVariables)
  const darkKeys = Object.keys(darkVariables)

  if (lightKeys.length !== darkKeys.length || lightKeys.some((key) => !darkKeys.includes(key))) {
    throw new Error('Light and dark themes must serialize the same CSS variable contract.')
  }

  const renderBlock = (selector, variables) => {
    const declarations = Object.entries(variables)
      .map(([name, value]) => {
        const cssValue = value.startsWith('#') ? value.toLowerCase() : value
        return '  ' + name + ': ' + cssValue + ';'
      })
      .join('\n')
    return selector + ' {\n' + declarations + '\n}'
  }

  return (
    [
      '/* Generated from theme/defaults.ts by scripts/copy-theme-assets.cjs. */',
      renderBlock(":root,\n[data-tsuki-scheme='light']", lightVariables),
      renderBlock("[data-tsuki-scheme='dark']", darkVariables),
    ].join('\n\n') + '\n'
  )
}

fs.mkdirSync(outputRoot, { recursive: true })
fs.writeFileSync(sourceThemePath, createThemeCss())

for (const asset of assets) {
  fs.copyFileSync(path.join(sourceRoot, asset), path.join(outputRoot, asset))

  if (asset !== 'theme.css') {
    const { getDefaultTheme } = loadTypeScriptModule(path.join(sourceRoot, 'defaults.ts'))
    const { serializeTheme } = loadTypeScriptModule(path.join(sourceRoot, 'serialize-theme.ts'))
    const variableNames = Object.keys(serializeTheme(getDefaultTheme('light')))
    const contents = fs.readFileSync(path.join(outputRoot, asset), 'utf8')
    const missingVariables = variableNames.filter((name) => !contents.includes(name))

    if (missingVariables.length > 0) {
      throw new Error(asset + ' is missing Theme variable mappings: ' + missingVariables.join(', '))
    }
  }
}

console.log(`Copied ${assets.length} theme assets to ${path.relative(packageRoot, outputRoot)}`)
