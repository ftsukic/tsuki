# @ftsukic/tsuki

Tsuki v2 is a React Native component and theme foundation. The first public components are `Button` and `Input`.

## Install

```bash
pnpm add @ftsukic/tsuki
```

Tsuki expects React Native `>=0.86.0` and declares React, Gesture Handler, Reanimated, Safe Area Context, SVG, and Worklets as peer dependencies. Install native packages at versions supported by your Expo SDK. Tsuki Core has no NativeWind, Tailwind, `react-native-css`, or `react-native-teleport` runtime dependency.

## Use components

The consumer owns system appearance and persistence, then passes the resolved scheme to `TsukiProvider`:

```tsx
import { Button, Input, TsukiProvider } from '@ftsukic/tsuki'
import { Text } from 'react-native'

export default function App() {
  return (
    <TsukiProvider scheme="light">
      <Button
        className="bg-tsuki-primary rounded-tsuki-button"
        classNames={{ root: 'px-4', content: 'font-semibold', icon: 'mr-2' }}
        icon={<Text>✓</Text>}
        style={{ minWidth: 96 }}
        styles={{ content: { letterSpacing: 0.2 } }}
      >
        Save
      </Button>
      <Input
        accessibilityLabel="Search"
        error="Try a shorter search"
        placeholder="Search items"
        prefix={<Text>⌕</Text>}
      />
    </TsukiProvider>
  )
}
```

`className` is the root utility string. `classNames` targets semantic slots. `style` is the root React Native style; `styles` targets native style slots such as Button `content` or Input `input`.

## Theme scopes

The project passes light/dark choice and semantic/component overrides into Tsuki. `ConfigProvider` creates nested scopes; `inherit: false` resets a scope to the default values for its current scheme before applying local overrides.

```tsx
import { Button, ConfigProvider } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{
    semantic: { colorPrimary: '#7c3aed' },
    components: { Button: { borderRadius: 12, height: 48 } },
  }}
>
  <Button>Continue</Button>
</ConfigProvider>
```

`useTsukiTheme()` reads the resolved scope. `serializeTheme()` converts its semantic and component tokens to CSS variables so the consuming app can pass them to its NativeWind bridge.

## NativeWind stylesheets

Tsuki does not import CSS from the JavaScript root. Consumer apps choose their own Tailwind runtime and import the matching assets:

- NativeWind 4: add `@ftsukic/tsuki/nativewind-v4-preset` to the Tailwind presets. Tailwind 3's `postcss-import` does not resolve this package's CSS export map, so import `node_modules/@ftsukic/tsuki/dist/theme/theme.css` from the app stylesheet.
- NativeWind 5: import `@ftsukic/tsuki/theme.css` and `@ftsukic/tsuki/nativewind-v5.css` from the app's global stylesheet.

See [the v2 framework guide](https://github.com/ftsukic/tsuki/blob/main/docs/architecture/tsuki-v2-project-framework.md) for provider bridges and exact consumer setup.

## Historical source

The former 1.x source remains in `packages/tsuki/bak/src` in the repository and is not included in the npm package. The old Playground and component pages remain historical 1.x references.

## License

MIT
