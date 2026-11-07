// Expo loads local config plugins through Node's CommonJS loader.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createRunOncePlugin, withMainActivity } = require('expo/config-plugins')

const PLUGIN_NAME = 'with-android-preferred-refresh-rate'
const BEGIN_MARKER = `// @generated begin ${PLUGIN_NAME}`
const END_MARKER = `// @generated end ${PLUGIN_NAME}`
const REQUEST_CODE = [
  BEGIN_MARKER,
  'if (',
  '  android.os.Build.VERSION.SDK_INT >= 34 ||',
  '    (android.os.Build.VERSION.SDK_INT >= 21 &&',
  '      windowManager.defaultDisplay.supportedRefreshRates.any {',
  '        kotlin.math.abs(it - 120f) < 1f',
  '      })',
  ') {',
  '  window.attributes = window.attributes.apply { preferredRefreshRate = 120f }',
  '}',
  END_MARKER,
].join('\n')

function withAndroidPreferredRefreshRate(config) {
  return withMainActivity(config, (config) => {
    const { contents } = config.modResults
    const hasBeginMarker = contents.includes(BEGIN_MARKER)
    const hasEndMarker = contents.includes(END_MARKER)

    if (hasBeginMarker && hasEndMarker) return config
    if (hasBeginMarker || hasEndMarker) {
      throw new Error(
        `[${PLUGIN_NAME}] Found an incomplete generated marker pair in MainActivity.kt`,
      )
    }

    const onCreateCall = /^([\t ]*)super\.onCreate\(null\)[\t ]*$/gm
    const matches = [...contents.matchAll(onCreateCall)]

    if (matches.length !== 1) {
      throw new Error(
        `[${PLUGIN_NAME}] Expected exactly one super.onCreate(null) in MainActivity.kt; found ${matches.length}`,
      )
    }

    const [match] = matches
    const requestCode = REQUEST_CODE.split('\n')
      .map((line) => `${match[1]}${line}`)
      .join('\n')
    const insertion = `${match[0]}\n${requestCode}`
    config.modResults.contents = contents.replace(match[0], insertion)

    return config
  })
}

module.exports = createRunOncePlugin(withAndroidPreferredRefreshRate, PLUGIN_NAME, '1.0.0')
