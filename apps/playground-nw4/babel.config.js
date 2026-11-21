module.exports = function (api) {
  api.cache(true)
  const nativewind = require('nativewind/babel')()
  // Resolve the preset's existing JSX plugin from its owner under pnpm isolation.
  nativewind.plugins[1][0] = require.resolve('@babel/plugin-transform-react-jsx', {
    paths: [require.resolve('react-native-css-interop/babel')],
  })
  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], nativewind],
    plugins: ['react-native-worklets/plugin'],
  }
}
