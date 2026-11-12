// Expo loads local config plugins through Node's CommonJS loader.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withAndroidStyles, createRunOncePlugin } = require('expo/config-plugins')

const TEXT_VIEW_STYLE = 'Widget.Tsuki.TextView'
const EDIT_TEXT_STYLE = 'Widget.Tsuki.EditText'

const TEXT_METRICS = [
  {
    name: 'android:elegantTextHeight',
    value: 'false',
  },
  {
    name: 'android:useLocalePreferredLineHeightForMinimum',
    value: 'false',
  },
]

function ensureArray(object, key) {
  if (!object[key]) {
    object[key] = []
  } else if (!Array.isArray(object[key])) {
    object[key] = [object[key]]
  }

  return object[key]
}

function upsertItem(style, name, value) {
  const items = ensureArray(style, 'item')

  const existing = items.find((item) => item.$?.name === name)

  if (existing) {
    existing._ = value
  } else {
    items.push({
      $: { name },
      _: value,
    })
  }
}

function ensureStyle(styles, name, parent) {
  const groups = ensureArray(styles.resources, 'style')

  let style = groups.find((item) => item.$?.name === name)

  if (!style) {
    style = {
      $: { name, parent },
      item: [],
    }

    groups.push(style)
  } else if (style.$.parent !== parent) {
    throw new Error(`[TextMetrics] Unexpected parent: ${name}`)
  }

  return style
}

function withAndroidTextMetrics(config) {
  return withAndroidStyles(config, (config) => {
    const styles = config.modResults
    const groups = ensureArray(styles.resources, 'style')

    const appTheme = groups.find((style) => style.$?.name === 'AppTheme')

    if (!appTheme) {
      throw new Error('[TextMetrics] AppTheme not found')
    }

    const textView = ensureStyle(styles, TEXT_VIEW_STYLE, 'Widget.AppCompat.TextView')

    const editText = ensureStyle(styles, EDIT_TEXT_STYLE, 'Widget.AppCompat.EditText')

    for (const item of TEXT_METRICS) {
      upsertItem(textView, item.name, item.value)
      upsertItem(editText, item.name, item.value)
    }

    upsertItem(appTheme, 'android:textViewStyle', `@style/${TEXT_VIEW_STYLE}`)

    upsertItem(appTheme, 'editTextStyle', `@style/${EDIT_TEXT_STYLE}`)

    upsertItem(appTheme, 'android:editTextStyle', `@style/${EDIT_TEXT_STYLE}`)

    return config
  })
}

module.exports = createRunOncePlugin(withAndroidTextMetrics, 'with-android-text-metrics', '1.0.0')
