const { getDefaultConfig } = require('expo/metro-config')
const { withNativewind } = require('nativewind/metro')

module.exports = withNativewind(getDefaultConfig(__dirname), {
  inlineVariables: {
    exclude: [
      '--tsuki-color-primary',
      '--tsuki-color-primary-foreground',
      '--tsuki-color-success',
      '--tsuki-color-warning',
      '--tsuki-color-danger',
      '--tsuki-color-foreground',
      '--tsuki-color-muted',
      '--tsuki-color-background',
      '--tsuki-color-surface',
      '--tsuki-color-border',
      '--tsuki-button-border-radius',
      '--tsuki-button-height',
      '--tsuki-input-border-radius',
      '--tsuki-input-height',
    ],
  },
})
