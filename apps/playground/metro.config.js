const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')
const fs = require('node:fs')
const { withNativewind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)
const v2SourceRoot = path.resolve(__dirname, '../../packages/tsuki/src')
const legacySourceRoot = path.resolve(__dirname, '../../packages/tsuki/bak/src')
const legacyPlaygroundAssetsPrefix = '../../../../../../apps/playground/assets/'

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@ftsukic/tsuki') {
    const fromV2 = path.relative(v2SourceRoot, context.originModulePath)
    const sourceRoot =
      fromV2.startsWith('..') || path.isAbsolute(fromV2) ? legacySourceRoot : v2SourceRoot
    return context.resolveRequest(context, sourceRoot, platform)
  }

  if (moduleName.startsWith('@tsuki-v2/')) {
    const subpath = moduleName.slice('@tsuki-v2/'.length)
    return context.resolveRequest(context, path.join(v2SourceRoot, subpath), platform)
  }

  const legacySubpathPrefix = '@ftsukic/tsuki/'
  if (moduleName.startsWith(legacySubpathPrefix)) {
    const subpath = moduleName.slice(legacySubpathPrefix.length)
    return context.resolveRequest(context, path.join(legacySourceRoot, subpath), platform)
  }

  if (moduleName.startsWith(legacyPlaygroundAssetsPrefix)) {
    const assetPath = path.join(
      __dirname,
      'assets',
      moduleName.slice(legacyPlaygroundAssetsPrefix.length),
    )
    return context.resolveRequest(context, assetPath, platform)
  }

  const origin =
    moduleName === 'nativewind' ? { ...context, originModulePath: __filename } : context
  return context.resolveRequest(origin, moduleName, platform)
}

// Theme controls override these defaults at runtime.
const themeCss = fs.readFileSync(path.join(v2SourceRoot, 'theme/theme.css'), 'utf8')
const themeVariables = [
  ...new Set([...themeCss.matchAll(/(--tsuki-[\w-]+):/g)].map((match) => match[1])),
]

module.exports = withNativewind(config, { inlineVariables: { exclude: themeVariables } })
