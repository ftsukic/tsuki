const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')

const config = getDefaultConfig(__dirname)
const legacySourceRoot = path.resolve(__dirname, '../../packages/tsuki/bak/src')
const legacyPlaygroundAssetsPrefix = '../../../../../../apps/playground/assets/'

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@ftsukic/tsuki') {
    return context.resolveRequest(context, legacySourceRoot, platform)
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

  return context.resolveRequest(context, moduleName, platform)
}

module.exports = config
