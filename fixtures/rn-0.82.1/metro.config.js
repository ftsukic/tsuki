const path = require('node:path')
const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config')

module.exports = mergeConfig(getDefaultConfig(__dirname), {
  watchFolders: [path.resolve(__dirname, '../..')],
  resolver: {
    resolveRequest(context, name, platform) {
      // Workspace package development peers differ from this fixture's runtime.
      if (
        name === 'react-native' ||
        name.startsWith('react-native/') ||
        name === 'react' ||
        name.startsWith('react/')
      ) {
        return context.resolveRequest(
          { ...context, originModulePath: path.join(__dirname, 'index.js') },
          name,
          platform,
        )
      }
      return context.resolveRequest(context, name, platform)
    },
  },
})
