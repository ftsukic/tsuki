# @ftsukic/tsuki

Tsuki is a React Native UI component library. Tsuki v2 is the current package API and contains nine component families, a light/dark theme system, and explicit NativeWind stylesheet resources. The v1 implementation remains in the repository at `packages/tsuki/bak/src`; it is not part of this npm package.

## Install

The current release line is in beta and is published to the `next` npm dist-tag:

```bash
pnpm add @ftsukic/tsuki@next
# or: npm install @ftsukic/tsuki@next
```

After the package moves to a stable release, install `@ftsukic/tsuki` without the `@next` tag.

### React Native and Expo requirements

| Peer dependency                  | Supported range   |
| -------------------------------- | ----------------- |
| `react`                          | `>=19.2.3`        |
| `react-native`                   | `>=0.86.0`        |
| `react-native-gesture-handler`   | `>=2.32.0 <3.0.0` |
| `react-native-reanimated`        | `>=4.7.1 <5.0.0`  |
| `react-native-safe-area-context` | `>=5.7.0 <6.0.0`  |
| `react-native-svg`               | `>=15.16.0`       |
| `react-native-worklets`          | `>=0.13.0`        |

Tsuki does not select an Expo SDK. Choose an SDK whose bundled React and React Native versions satisfy these ranges. The repository's v4 and v5 consumer apps currently validate with Expo SDK `57.0.32`, React Native `0.86.3`, and React `19.2.3`.

Install the native peer packages at versions supported by your Expo SDK:

```bash
npx expo install react-native-gesture-handler react-native-reanimated react-native-safe-area-context react-native-svg react-native-worklets
```

For a bare React Native app, install the same peer dependencies at versions within the ranges above and follow each library's native setup instructions.

## Quick start

```tsx
import { Button, TsukiProvider } from '@ftsukic/tsuki'

export default function App() {
  return (
    <TsukiProvider scheme="light">
      <Button>Continue</Button>
    </TsukiProvider>
  )
}
```

`TsukiProvider` requires a resolved `scheme` of `light` or `dark`. Resolve `system` appearance in the app and pass the result to the provider:

```tsx
import { TsukiProvider } from '@ftsukic/tsuki'
import type { PropsWithChildren } from 'react'
import { useColorScheme } from 'react-native'

export function ThemeRoot({ children }: PropsWithChildren) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  return <TsukiProvider scheme={scheme}>{children}</TsukiProvider>
}
```

## Components

The package root is the supported JavaScript entry point. It exports these nine component families; `CellGroup` is exported with the `Cell` family.

| Component | Main capabilities |
| --- | --- |
| [`Button`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/button/index.md) | Pressable interaction, solid/outlined/ghost variants, three sizes, leading icon, loading and disabled states, semantic text slots. |
| [`Card`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/card/index.md) | Surface-backed content container with optional `Header`, `Body`, and `Footer` sections. |
| [`Cell` / `CellGroup`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/cell/index.md) | Settings and information rows, descriptions, values, leading/trailing content, actions, arrows, dividers, and grouped inset layouts. |
| [`Divider`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/divider/index.md) | Horizontal and vertical separators with theme thickness, color, and inset. |
| [`Icon`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/icon/index.md) | Curated Ant Design SVG icons, custom SVG definitions, two-tone colors, rotation, and optional accessible press targets. |
| [`Input`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/input/index.md) | Native `TextInput` behavior, controlled or initial values, prefix/suffix content, disabled state, and validation error feedback. |
| [`Space`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/space/index.md) | Horizontal or vertical layout, gaps, alignment, wrapping, and native View props. |
| [`Surface`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/surface/index.md) | Themed background, radius, padding, optional border, inset, clipping, and child layout. |
| [`Text`](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/text/index.md) | Native Text props and refs, six typography variants, nesting, and `TextClassContext` class inheritance. |

## Theme scopes

The app owns system appearance and persistence. `TsukiProvider` supplies the active scheme; nested `ConfigProvider` components apply partial semantic or component overrides.

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

Scopes inherit from their parent by default. Set `inherit: false` to start from the defaults for the active scheme, then apply that scope's overrides. See the [Theme v2 guide](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/theme/index.md) for all tokens, inheritance rules, and NativeWind variable bridges.

## Styling: `className`, `classNames`, `style`, and `styles`

- `className` applies NativeWind utility classes to a component's root. A NativeWind runtime and the matching Tsuki CSS resources must be configured for these classes to work.
- `classNames` applies utility classes to named semantic slots on components that expose slots, such as Button, Input, and Cell.
- `style` is the root React Native style.
- `styles` applies React Native style values to named slots, such as Button `content` or Input `input`.

Not every component exposes all four props. `Text` exposes `className` and inherited native `style`; Divider, Space, and Surface expose root `className` and `style`; Card sections also accept root `className` and `style`. Slot names and precedence are component-specific; see the component pages linked above. Native React Native styles work without NativeWind.

## NativeWind integration

Tsuki Core does not depend on NativeWind, Tailwind, `react-native-css`, or PostCSS. The two repository Consumers keep their NativeWind dependencies and Metro runtimes separate. Use one configuration per app; do not combine v4 and v5 packages in one dependency tree.

### NativeWind v4 and Tailwind CSS v3

The repository validation app pins NativeWind `4.2.7`, Tailwind CSS `3.4.17`, and `react-native-css-interop` `0.2.7`. Its Tailwind preset adds Tsuki's token utilities:

```js
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './node_modules/@ftsukic/tsuki/dist/**/*.{js,cjs}'],
  presets: [require('nativewind/preset'), require('@ftsukic/tsuki/nativewind-v4-preset')],
  theme: { extend: {} },
  plugins: [],
}
```

Import the package's static theme stylesheet from the installed file in the app's `global.css`, then enable Tailwind's layers:

```css
@import './node_modules/@ftsukic/tsuki/dist/theme/theme.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Tailwind 3's `postcss-import` does not resolve this package's CSS export map in the current consumer setup, so use the installed `dist/theme/theme.css` path shown above. Configure Metro with `withNativeWind` and configure Babel with the NativeWind preset. The repository has the complete [v4 Tailwind config](https://github.com/ftsukic/tsuki/blob/main/apps/nativewind-v4-consumer/tailwind.config.js), [Metro config](https://github.com/ftsukic/tsuki/blob/main/apps/nativewind-v4-consumer/metro.config.js), and [Babel config](https://github.com/ftsukic/tsuki/blob/main/apps/nativewind-v4-consumer/babel.config.js).

Inject runtime theme variables with NativeWind v4's `vars()`:

```tsx
import { serializeTheme, useTsukiTheme } from '@ftsukic/tsuki'
import { vars } from 'nativewind'
import { View } from 'react-native'

function ThemeVariables({ children }: React.PropsWithChildren) {
  const theme = useTsukiTheme()
  return <View style={[vars(serializeTheme(theme)), { flex: 1 }]}>{children}</View>
}
```

Place this bridge below the `TsukiProvider` or `ConfigProvider` whose variables it should provide.

### NativeWind v5 and Tailwind CSS v4

The repository validation app pins NativeWind `5.0.0-rc.1`, `react-native-css` `3.1.0-rc.1`, and Tailwind CSS `4.1.12`. NativeWind v5 is a release candidate in this configuration. Its `global.css` imports Tailwind, NativeWind, and both Tsuki CSS resources:

```css
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css';
@import 'nativewind/theme';
@import '@ftsukic/tsuki/theme.css';
@import '@ftsukic/tsuki/nativewind-v5.css';

@source './node_modules/@ftsukic/tsuki/dist';
```

Use `@tailwindcss/postcss` in PostCSS and `withNativewind` in Metro. The Metro config must exclude the complete set of dynamic `--tsuki-*` theme variables from inlining; copy the [v5 Metro config](https://github.com/ftsukic/tsuki/blob/main/apps/nativewind-v5-consumer/metro.config.js). The [v5 PostCSS config](https://github.com/ftsukic/tsuki/blob/main/apps/nativewind-v5-consumer/postcss.config.js) and [global stylesheet](https://github.com/ftsukic/tsuki/blob/main/apps/nativewind-v5-consumer/global.css) are runnable references.

Inject runtime values with NativeWind v5's `VariableContextProvider`:

```tsx
import { serializeTheme, useTsukiTheme } from '@ftsukic/tsuki'
import { VariableContextProvider } from 'nativewind'
import { View } from 'react-native'

function ThemeVariables({ children }: React.PropsWithChildren) {
  const theme = useTsukiTheme()
  return (
    <VariableContextProvider value={serializeTheme(theme)}>
      <View style={{ flex: 1 }}>{children}</View>
    </VariableContextProvider>
  )
}
```

For nested `ConfigProvider` scopes, put a matching variable bridge inside each scope so its CSS variables apply only to that scope's descendants.

## Documentation and examples

- [All component documentation](https://github.com/ftsukic/tsuki/blob/main/docs/components/index.md)
- [Theme v2 guide](https://github.com/ftsukic/tsuki/blob/main/docs/components/v2/theme/index.md)
- [Architecture and consumer setup](https://github.com/ftsukic/tsuki/blob/main/docs/architecture/tsuki-v2-project-framework.md)
- [Expo Playground](https://github.com/ftsukic/tsuki/tree/main/apps/playground)
- [Canonical v2 fixtures](https://github.com/ftsukic/tsuki/tree/main/packages/tsuki/src)
- [NativeWind v4 Consumer](https://github.com/ftsukic/tsuki/tree/main/apps/nativewind-v4-consumer)
- [NativeWind v5 Consumer](https://github.com/ftsukic/tsuki/tree/main/apps/nativewind-v5-consumer)

## License

MIT
