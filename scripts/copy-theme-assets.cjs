const fs = require('node:fs')
const path = require('node:path')
const vm = require('node:vm')

const packageRoot = path.resolve(__dirname, '..', 'packages', 'tsuki')
const sourceRoot = path.join(packageRoot, 'src', 'theme')
const styleRoot = path.join(packageRoot, 'src', 'style')
const outputRoot = path.join(packageRoot, 'dist', 'theme')

const typescript = require(require.resolve('typescript', { paths: [packageRoot] }))

function toKebabCase(value) {
  return value.replace(/[A-Z]/g, (character) => `-${character.toLowerCase()}`)
}

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

function formatKey(key) {
  return /^[a-zA-Z_$][\w$]*$/.test(key) ? key : `'${key}'`
}

function formatStringEntry(indent, key, value) {
  const line = `${indent}${formatKey(key)}: '${value}',`
  if (line.length <= 100) return line
  return `${indent}${formatKey(key)}:\n${indent}  '${value}',`
}

function formatCssVarDecl(indent, property, cssVar) {
  const line = `${indent}${property}: var(${cssVar});`
  if (line.length <= 100) return line
  return `${indent}${property}: var(\n${indent}  ${cssVar}\n${indent});`
}

function describeComponentToken(component, token, cssVar) {
  const kebabToken = toKebabCase(token)
  switch (component) {
    case 'Button':
      if (token === 'borderRadius') return { kind: 'radius', key: 'tsuki-button', cssVar }
      if (token === 'height') return { kind: 'height', key: 'tsuki-button', cssVar }
      if (token === 'disabledOpacity') {
        return { kind: 'opacity', key: 'tsuki-button-disabled-opacity', cssVar }
      }
      break
    case 'Input':
      if (token === 'borderRadius') return { kind: 'radius', key: 'tsuki-input', cssVar }
      if (token === 'height') return { kind: 'height', key: 'tsuki-input', cssVar }
      if (token === 'disabledOpacity') {
        return { kind: 'opacity', key: 'tsuki-input-disabled-opacity', cssVar }
      }
      break
    case 'Divider':
      if (token === 'thickness') return { kind: 'spacing', key: 'tsuki-divider', cssVar }
      break
    case 'Surface':
      if (token === 'borderRadius') return { kind: 'radius', key: 'tsuki-surface', cssVar }
      if (token === 'padding') return { kind: 'spacing', key: 'tsuki-surface', cssVar }
      if (token === 'borderWidth')
        return { kind: 'borderWidth', key: 'tsuki-surface-width', cssVar }
      break
    case 'Card':
      if (token === 'borderRadius') return { kind: 'radius', key: 'tsuki-card', cssVar }
      if (token === 'padding') return { kind: 'spacing', key: 'tsuki-card', cssVar }
      if (token === 'headerPadding') return { kind: 'spacing', key: 'tsuki-card-header', cssVar }
      if (token === 'bodyPadding') return { kind: 'spacing', key: 'tsuki-card-body', cssVar }
      if (token === 'footerPadding') return { kind: 'spacing', key: 'tsuki-card-footer', cssVar }
      if (token === 'gap') return { kind: 'spacing', key: 'tsuki-card-gap', cssVar }
      break
    case 'Dialog':
      if (token === 'width') return { kind: 'spacing', key: 'tsuki-dialog', cssVar }
      if (token === 'borderRadius') return { kind: 'radius', key: 'tsuki-dialog', cssVar }
      if (token === 'backgroundColor') {
        return {
          kind: 'color',
          key: 'tsuki-dialog-background',
          v4ColorKey: 'dialog-background',
          cssVar,
        }
      }
      if (token === 'overlayColor') {
        return { kind: 'color', key: 'tsuki-dialog-overlay', v4ColorKey: 'dialog-overlay', cssVar }
      }
      if (token === 'titleFontSize') return { kind: 'fontSize', key: 'tsuki-dialog-title', cssVar }
      if (token === 'messageFontSize') {
        return { kind: 'fontSize', key: 'tsuki-dialog-message', cssVar }
      }
      if (token === 'contentPadding')
        return { kind: 'spacing', key: 'tsuki-dialog-content', cssVar }
      if (token === 'buttonHeight') return { kind: 'height', key: 'tsuki-dialog-button', cssVar }
      if (token === 'animationDuration') return { kind: 'duration', key: 'tsuki-dialog', cssVar }
      break
    case 'Popup':
      if (token === 'backgroundColor') {
        return {
          kind: 'color',
          key: 'tsuki-popup-background',
          v4ColorKey: 'popup-background',
          cssVar,
        }
      }
      if (token === 'overlayColor') {
        return { kind: 'color', key: 'tsuki-popup-overlay', v4ColorKey: 'popup-overlay', cssVar }
      }
      if (token === 'borderRadius') return { kind: 'radius', key: 'tsuki-popup', cssVar }
      if (token === 'animationDuration') return { kind: 'duration', key: 'tsuki-popup', cssVar }
      break
    case 'Cell':
      if (token === 'groupRadius') return { kind: 'radius', key: 'tsuki-cell-group-radius', cssVar }
      if (token === 'disabledOpacity') {
        return { kind: 'opacity', key: 'tsuki-cell-disabled-opacity', cssVar }
      }
      if (token === 'fontSize' || token === 'largeFontSize' || token === 'descriptionFontSize') {
        return { kind: 'fontSize', key: `tsuki-cell-${kebabToken}`, cssVar }
      }
      if (token === 'lineHeight' || token === 'descriptionLineHeight') {
        return { kind: 'lineHeight', key: `tsuki-cell-${kebabToken}`, cssVar }
      }
      return { kind: 'spacing', key: `tsuki-cell-${kebabToken}`, cssVar }
  }
  throw new Error(`No Tailwind token mapping defined for components.${component}.${token}`)
}

function loadTokenModel() {
  const { getDefaultTheme } = loadTypeScriptModule(path.join(sourceRoot, 'defaults.ts'))
  const { serializeTheme } = loadTypeScriptModule(path.join(sourceRoot, 'serialize-theme.ts'))
  const lightTheme = getDefaultTheme('light')
  const darkTheme = getDefaultTheme('dark')
  const lightVariables = serializeTheme(lightTheme)
  const darkVariables = serializeTheme(darkTheme)
  const lightKeys = Object.keys(lightVariables)
  const darkKeys = Object.keys(darkVariables)

  if (lightKeys.length !== darkKeys.length || lightKeys.some((key) => !darkKeys.includes(key))) {
    throw new Error('Light and dark themes must serialize the same CSS variable contract.')
  }

  const descriptors = []
  for (const token of Object.keys(lightTheme.semantic)) {
    const cssVar = `--tsuki-${toKebabCase(token)}`
    const colorName = toKebabCase(token).replace(/^color-/, '')
    descriptors.push({
      kind: 'color',
      key: `tsuki-${colorName}`,
      v4ColorKey: colorName,
      cssVar,
    })
  }

  for (const [component, tokens] of Object.entries(lightTheme.components)) {
    for (const token of Object.keys(tokens)) {
      const cssVar = `--tsuki-${component.toLowerCase()}-${toKebabCase(token)}`
      descriptors.push(describeComponentToken(component, token, cssVar))
    }
  }

  const describedVars = new Set(descriptors.map((item) => item.cssVar))
  const missingVars = lightKeys.filter((name) => !describedVars.has(name))
  if (missingVars.length > 0) {
    throw new Error(`Serialized variables missing token descriptors: ${missingVars.join(', ')}`)
  }

  return { lightVariables, darkVariables, variableNames: lightKeys, descriptors }
}

function createThemeCss({ lightVariables, darkVariables }) {
  const renderBlock = (selector, variables) => {
    const declarations = Object.entries(variables)
      .map(([name, value]) => {
        const cssValue = value.startsWith('#') ? value.toLowerCase() : value
        return `  ${name}: ${cssValue};`
      })
      .join('\n')
    return `${selector} {\n${declarations}\n}`
  }

  return (
    [
      '/* Generated from theme/defaults.ts by scripts/copy-theme-assets.cjs. */',
      renderBlock(":root,\n[data-tsuki-scheme='light']", lightVariables),
      renderBlock("[data-tsuki-scheme='dark']", darkVariables),
    ].join('\n\n') + '\n'
  )
}

function createNativeWindV4Preset({ descriptors }) {
  const colors = descriptors.filter((item) => item.kind === 'color')
  const radii = descriptors.filter((item) => item.kind === 'radius')
  const heights = descriptors.filter((item) => item.kind === 'height')
  const spacings = descriptors.filter((item) => item.kind === 'spacing')
  const durations = descriptors.filter((item) => item.kind === 'duration')
  const borderWidths = descriptors.filter((item) => item.kind === 'borderWidth')
  const fontSizes = descriptors.filter((item) => item.kind === 'fontSize')
  const lineHeights = descriptors.filter((item) => item.kind === 'lineHeight')
  const opacities = descriptors.filter((item) => item.kind === 'opacity')

  const renderSection = (name, entries, indent = '      ') => {
    const lines = entries.map(([k, v]) => formatStringEntry(indent + '  ', k, v))
    return `${indent}${name}: {\n${lines.join('\n')}\n${indent}},`
  }

  return [
    '// Generated from theme/defaults.ts by scripts/copy-theme-assets.cjs.',
    'module.exports = {',
    '  theme: {',
    '    extend: {',
    '      colors: {',
    renderSection(
      'tsuki',
      colors.map((item) => [item.v4ColorKey, `var(${item.cssVar})`]),
      '        ',
    ),
    '      },',
    renderSection(
      'borderRadius',
      radii.map((item) => [item.key, `var(${item.cssVar})`]),
    ),
    renderSection(
      'height',
      heights.map((item) => [item.key, `var(${item.cssVar})`]),
    ),
    renderSection(
      'spacing',
      spacings.map((item) => [item.key, `var(${item.cssVar})`]),
    ),
    renderSection(
      'transitionDuration',
      durations.map((item) => [item.key, `var(${item.cssVar})`]),
    ),
    renderSection(
      'borderWidth',
      borderWidths.map((item) => [item.key, `var(${item.cssVar})`]),
    ),
    renderSection(
      'fontSize',
      fontSizes.map((item) => [item.key, `var(${item.cssVar})`]),
    ),
    renderSection(
      'lineHeight',
      lineHeights.map((item) => [item.key, `var(${item.cssVar})`]),
    ),
    renderSection(
      'opacity',
      opacities.map((item) => [item.key, `var(${item.cssVar})`]),
    ),
    '    },',
    '  },',
    '}',
    '',
  ].join('\n')
}

function createNativeWindV5Css({ descriptors }) {
  const themeDecls = []
  const utilities = []

  for (const item of descriptors) {
    switch (item.kind) {
      case 'color':
        themeDecls.push(formatCssVarDecl('  ', `--color-${item.key}`, item.cssVar))
        break
      case 'radius':
        themeDecls.push(formatCssVarDecl('  ', `--radius-${item.key}`, item.cssVar))
        break
      case 'height':
      case 'spacing':
        themeDecls.push(formatCssVarDecl('  ', `--spacing-${item.key}`, item.cssVar))
        break
      case 'fontSize':
        themeDecls.push(formatCssVarDecl('  ', `--text-${item.key}`, item.cssVar))
        break
      case 'duration':
        themeDecls.push(formatCssVarDecl('  ', `--duration-${item.key}`, item.cssVar))
        break
      case 'opacity':
        themeDecls.push(formatCssVarDecl('  ', `--opacity-${item.key}`, item.cssVar))
        break
      case 'borderWidth':
        utilities.push(`@utility border-${item.key} {\n  border-width: var(${item.cssVar});\n}`)
        break
      case 'lineHeight':
        break
    }
  }

  const lineHeights = descriptors.filter((item) => item.kind === 'lineHeight')
  const lineHeightUtilities = lineHeights.map(
    (item) =>
      `@utility leading-${item.key} {\n` +
      `  -rn-tsuki-line-height: var(${item.cssVar});\n` +
      '  -rn-native-mapping--rn-tsuki-line-height: &line-height;\n' +
      '  @variant web {\n' +
      `    line-height: var(${item.cssVar});\n` +
      '  }\n' +
      '}',
  )

  return (
    [
      '/* Generated from theme/defaults.ts by scripts/copy-theme-assets.cjs. */',
      `@theme inline {\n${themeDecls.join('\n')}\n}`,
      ...utilities,
      '/* NativeWind maps untyped CSS line-height variables as font-size multipliers. */',
      ...lineHeightUtilities,
    ].join('\n\n') + '\n'
  )
}

function createThemeVariablesCjs({ variableNames }) {
  const items = variableNames.map((name) => `  '${name}',`).join('\n')
  return [
    '// Generated from theme/defaults.ts by scripts/copy-theme-assets.cjs.',
    'const TSUKI_CSS_VARIABLES = Object.freeze([',
    items,
    '])',
    '',
    'module.exports = { TSUKI_CSS_VARIABLES }',
    '',
  ].join('\n')
}

function createThemeVariablesMjs({ variableNames }) {
  const items = variableNames.map((name) => `  '${name}',`).join('\n')
  return [
    '// Generated from theme/defaults.ts by scripts/copy-theme-assets.cjs.',
    'export const TSUKI_CSS_VARIABLES = Object.freeze([',
    items,
    '])',
    '',
  ].join('\n')
}

function createThemeVariablesDts() {
  const tokenTemplateType = '`--tsuki-$' + '{string}`'
  return [
    '// Generated from theme/defaults.ts by scripts/copy-theme-assets.cjs.',
    `export declare const TSUKI_CSS_VARIABLES: readonly ${tokenTemplateType}[]`,
    '',
  ].join('\n')
}

function formatStringArray(values, indent) {
  const singleLine = `[${values.map((value) => `'${value}'`).join(', ')}]`
  if (indent.length + singleLine.length <= 92) return singleLine
  return `[\n${values.map((value) => `${indent}  '${value}',`).join('\n')}\n${indent}]`
}

function createTailwindMergeConfig({ descriptors }) {
  const colors = descriptors.filter((item) => item.kind === 'color').map((item) => item.key)
  const radii = descriptors.filter((item) => item.kind === 'radius').map((item) => item.key)
  const spacings = descriptors
    .filter((item) => item.kind === 'spacing' || item.kind === 'height')
    .map((item) => item.key)
  const texts = descriptors.filter((item) => item.kind === 'fontSize').map((item) => item.key)
  const leadings = descriptors.filter((item) => item.kind === 'lineHeight').map((item) => item.key)
  const borderWidths = descriptors
    .filter((item) => item.kind === 'borderWidth')
    .map((item) => item.key)
  const opacities = descriptors.filter((item) => item.kind === 'opacity').map((item) => item.key)
  const durations = descriptors.filter((item) => item.kind === 'duration').map((item) => item.key)

  const renderClassGroup = (groupKey, prefix, values) => {
    const singleLine = `    ${formatKey(groupKey)}: [{ ${prefix}: [${values.map((value) => `'${value}'`).join(', ')}] }],`
    if (singleLine.length <= 100) return singleLine
    return [
      `    ${formatKey(groupKey)}: [`,
      '      {',
      `        ${prefix}: [`,
      ...values.map((value) => `          '${value}',`),
      '        ],',
      '      },',
      '    ],',
    ].join('\n')
  }

  return [
    '// Generated from theme/defaults.ts by scripts/copy-theme-assets.cjs.',
    'export const TSUKI_TAILWIND_MERGE_EXTENSION = {',
    '  theme: {',
    `    color: ${formatStringArray(colors, '    ')},`,
    `    leading: ${formatStringArray(leadings, '    ')},`,
    `    radius: ${formatStringArray(radii, '    ')},`,
    `    spacing: ${formatStringArray(spacings, '    ')},`,
    `    text: ${formatStringArray(texts, '    ')},`,
    '  },',
    '  classGroups: {',
    renderClassGroup('border-w', 'border', borderWidths),
    renderClassGroup('duration', 'duration', durations),
    renderClassGroup('opacity', 'opacity', opacities),
    '  },',
    '}',
    '',
  ].join('\n')
}

function buildGeneratedFiles() {
  const model = loadTokenModel()
  const sourceFiles = [
    { filePath: path.join(sourceRoot, 'theme.css'), content: createThemeCss(model) },
    {
      filePath: path.join(sourceRoot, 'nativewind-v4-preset.cjs'),
      content: createNativeWindV4Preset(model),
    },
    {
      filePath: path.join(sourceRoot, 'nativewind-v5.css'),
      content: createNativeWindV5Css(model),
    },
    {
      filePath: path.join(sourceRoot, 'theme-variables.cjs'),
      content: createThemeVariablesCjs(model),
    },
    {
      filePath: path.join(styleRoot, 'tsuki-tw-merge.ts'),
      content: createTailwindMergeConfig(model),
    },
  ]
  const distFiles = [
    { filePath: path.join(outputRoot, 'theme.css'), content: sourceFiles[0].content },
    {
      filePath: path.join(outputRoot, 'nativewind-v4-preset.cjs'),
      content: sourceFiles[1].content,
    },
    { filePath: path.join(outputRoot, 'nativewind-v5.css'), content: sourceFiles[2].content },
    { filePath: path.join(outputRoot, 'theme-variables.cjs'), content: sourceFiles[3].content },
    {
      filePath: path.join(outputRoot, 'theme-variables.mjs'),
      content: createThemeVariablesMjs(model),
    },
    {
      filePath: path.join(outputRoot, 'theme-variables.d.ts'),
      content: createThemeVariablesDts(),
    },
  ]
  return { sourceFiles, distFiles }
}

function normalizeEol(value) {
  return value.replace(/\r\n/g, '\n')
}

function checkSourceFiles(sourceFiles) {
  const stale = []
  for (const { filePath, content } of sourceFiles) {
    if (!fs.existsSync(filePath)) {
      stale.push(path.relative(packageRoot, filePath))
      continue
    }
    const existing = normalizeEol(fs.readFileSync(filePath, 'utf8'))
    if (existing !== normalizeEol(content)) {
      stale.push(path.relative(packageRoot, filePath))
    }
  }
  if (stale.length > 0) {
    throw new Error(
      `Generated theme files are out of date (${stale.join(', ')}). Run "pnpm run theme:generate".`,
    )
  }
}

const args = new Set(process.argv.slice(2))
const { sourceFiles, distFiles } = buildGeneratedFiles()

if (args.has('--check')) {
  checkSourceFiles(sourceFiles)
  console.log(`Verified ${sourceFiles.length} generated theme files are up to date.`)
} else if (args.has('--generate')) {
  for (const { filePath, content } of sourceFiles) {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, content, 'utf8')
  }
  console.log(`Generated ${sourceFiles.length} theme files from theme/defaults.ts.`)
} else {
  checkSourceFiles(sourceFiles)
  fs.mkdirSync(outputRoot, { recursive: true })
  for (const { filePath, content } of distFiles) {
    fs.writeFileSync(filePath, content, 'utf8')
  }
  console.log(
    `Copied ${distFiles.length} theme assets to ${path.relative(packageRoot, outputRoot)}`,
  )
}
