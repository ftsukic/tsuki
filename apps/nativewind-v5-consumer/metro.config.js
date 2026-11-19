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
      '--tsuki-surface-border-radius',
      '--tsuki-surface-padding',
      '--tsuki-surface-border-width',
      '--tsuki-card-border-radius',
      '--tsuki-card-padding',
      '--tsuki-card-header-padding',
      '--tsuki-card-body-padding',
      '--tsuki-card-footer-padding',
      '--tsuki-card-gap',
      '--tsuki-cell-padding-horizontal',
      '--tsuki-cell-padding-vertical',
      '--tsuki-cell-large-padding-vertical',
      '--tsuki-cell-min-height',
      '--tsuki-cell-large-min-height',
      '--tsuki-cell-font-size',
      '--tsuki-cell-large-font-size',
      '--tsuki-cell-description-font-size',
      '--tsuki-cell-line-height',
      '--tsuki-cell-description-line-height',
      '--tsuki-cell-icon-size',
      '--tsuki-cell-gap',
      '--tsuki-cell-vertical-gap',
      '--tsuki-cell-title-extra-gap',
      '--tsuki-cell-value-extra-gap',
      '--tsuki-cell-divider-width',
      '--tsuki-cell-group-title-padding-horizontal',
      '--tsuki-cell-group-title-padding-vertical',
      '--tsuki-cell-group-inset-margin-horizontal',
      '--tsuki-cell-group-radius',
      '--tsuki-cell-disabled-opacity',
    ],
  },
})
