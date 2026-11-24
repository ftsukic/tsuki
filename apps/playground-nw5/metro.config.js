const { getDefaultConfig } = require('expo/metro-config')
const { withNativewind } = require('nativewind/metro')
const { TSUKI_CSS_VARIABLES } = require('@ftsukic/tsuki/theme-variables')

const config = getDefaultConfig(__dirname)

module.exports = withNativewind(config, {
  warnings: 'verbose',
  inlineVariables: {
    exclude: [...TSUKI_CSS_VARIABLES],
  },
})
