const { getDefaultConfig } = require('expo/metro-config')
const { withNativewind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)
// Resolve Tsuki's optional NativeWind import from this consumer.
config.resolver.resolveRequest = (context, name, platform) => {
  const origin = name === 'nativewind' ? { ...context, originModulePath: __filename } : context
  return context.resolveRequest(origin, name, platform)
}

module.exports = withNativewind(config, {
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
      '--tsuki-divider-thickness',
    ],
  },
})
