/* eslint-disable @typescript-eslint/no-require-imports */
const path = require('path')

const { getDefaultConfig } = require('expo/metro-config')

const projectRoot = __dirname
const workspaceRoot = path.resolve(projectRoot, '..')
const projectNodeModules = path.resolve(projectRoot, 'node_modules')

const config = getDefaultConfig(projectRoot)

config.watchFolders = [workspaceRoot]
config.resolver.disableHierarchicalLookup = true
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
]
config.resolver.extraNodeModules = {
  ...(config.resolver.extraNodeModules ?? {}),
  '@ftsukic/tsuki': path.resolve(workspaceRoot, 'src'),
  react: path.resolve(projectNodeModules, 'react'),
  'react-native': path.resolve(projectNodeModules, 'react-native'),
  'react-native-safe-area-context': path.resolve(
    projectNodeModules,
    'react-native-safe-area-context',
  ),
  'react-native-gesture-handler': path.resolve(projectNodeModules, 'react-native-gesture-handler'),
  'react-native-reanimated': path.resolve(projectNodeModules, 'react-native-reanimated'),
  'react-native-svg': path.resolve(projectNodeModules, 'react-native-svg'),
  'react-native-worklets': path.resolve(projectNodeModules, 'react-native-worklets'),
}

module.exports = config
