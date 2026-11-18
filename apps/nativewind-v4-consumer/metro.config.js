const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)
// Resolve Tsuki's optional NativeWind import from this consumer.
config.resolver.resolveRequest = (context, name, platform) => {
  const origin = name === 'nativewind' ? { ...context, originModulePath: __filename } : context
  return context.resolveRequest(origin, name, platform)
}

module.exports = withNativeWind(config, { input: './global.css' })
