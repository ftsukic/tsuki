import type { ConfigContext, ExpoConfig } from 'expo/config'

const appLine = process.env.APP_LINE
const appVariant = process.env.APP_VARIANT

if (appLine !== '0.x' && appLine !== '1.x') {
  throw new Error(
    `APP_LINE must be "0.x" or "1.x"; received ${appLine === undefined ? 'no value' : JSON.stringify(appLine)}`,
  )
}

if (appVariant !== 'development' && appVariant !== 'production') {
  throw new Error(
    `APP_VARIANT must be "development" or "production"; received ${appVariant === undefined ? 'no value' : JSON.stringify(appVariant)}`,
  )
}

const identity =
  appLine === '0.x'
    ? {
        name: 'TsukiLegacy',
        scheme: 'example-legacy',
        bundleIdentifier: 'com.ftsukic.example.legacy',
        package: 'com.ftsukic.example.legacy',
      }
    : {
        name: 'Tsuki Playground',
        scheme: 'example',
        bundleIdentifier: 'com.ftsukic.example',
        package: 'com.ftsukic.example',
      }

const baseConfig: ExpoConfig = {
  name: identity.name,
  slug: 'example',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: identity.scheme,
  userInterfaceStyle: 'automatic',
  ios: {
    supportsTablet: true,
    bundleIdentifier: identity.bundleIdentifier,
    appleTeamId: 'FH78Y697Y4',
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#E6F4FE',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    package: identity.package,
    predictiveBackGestureEnabled: false,
    permissions: [],
  },
  web: {
    bundler: 'metro',
    output: 'single',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-build-properties',
      {
        ios: {
          enableSceneSupport: true,
        },
      },
    ],
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    'react-native-fast-image',
    'react-native-video',
    './plugins/with-android-text-metric.js',
    './plugins/with-android-preferred-refresh-rate.js',
  ],
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...baseConfig,
  extra: {
    ...baseConfig.extra,
    ...config.extra,
    appLine,
    appVariant,
  },
})
