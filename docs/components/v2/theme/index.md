# Theme v2

Tsuki v2 Theme 是一组轻量级的 scheme、semantic color 和 component layout token。组件和 Theme API 从 `@ftsukic/tsuki` 根入口导入。应用管理 System / Light / Dark 选择，并把已解析的 `light` 或 `dark` scheme 传给 `TsukiProvider`。

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

`ThemeScheme` 是 `'light' | 'dark'`。`TsukiProviderProps` 还接受可选的 `theme`；`TsukiProvider` 不负责读取系统外观，也不接受 `scheme="system"`。以下写法在 app 边界将系统外观解析为 Theme scheme：

```tsx
import { TsukiProvider } from '@ftsukic/tsuki'
import { useColorScheme } from 'react-native'
import type { PropsWithChildren } from 'react'

function ThemeRoot({ children }: PropsWithChildren) {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light'
  return <TsukiProvider scheme={scheme}>{children}</TsukiProvider>
}
```

## `ConfigProvider`

`ConfigProvider` 接受部分 `ThemeConfig`，并作用于其子树。Semantic Token 和每个 Component Token 都可以独立覆盖：

```tsx
import { Button, ConfigProvider } from '@ftsukic/tsuki'

;<ConfigProvider
  theme={{
    semantic: {
      colorPrimary: '#7c3aed',
    },
    components: {
      Button: {
        borderRadius: 12,
        height: 48,
      },
    },
  }}
>
  <Button>Continue</Button>
</ConfigProvider>
```

真实类型允许的顶层字段如下：

```ts
interface ThemeConfig {
  semantic?: Partial<SemanticTokens>
  components?: {
    Button?: Partial<ButtonThemeTokens>
    Card?: Partial<CardThemeTokens>
    Cell?: Partial<CellThemeTokens>
    Divider?: Partial<DividerThemeTokens>
    Input?: Partial<InputThemeTokens>
    Surface?: Partial<SurfaceThemeTokens>
  }
  inherit?: boolean
}
```

`ConfigProvider` 只有 `theme` 和 `children`，不接收 `scheme`。Scheme 由最近的 `TsukiProvider` 决定并贯穿嵌套 scopes。

## Theme inheritance and updates

默认情况下，子 `ConfigProvider` 会分别合并父级的 `semantic` 和各组 `components` token。子级只需声明希望覆盖的值；未声明的值继续继承。

```tsx
<TsukiProvider scheme="light" theme={{ semantic: { colorPrimary: '#2563eb' } }}>
  <ConfigProvider theme={{ components: { Card: { borderRadius: 16 } } }}>
    <Card>
      <Text>Parent color and local Card radius</Text>
      <ConfigProvider theme={{ semantic: { colorPrimary: '#7c3aed' } }}>
        <Card>
          <Text>Child primary color, inherited Card radius</Text>
        </Card>
      </ConfigProvider>
    </Card>
  </ConfigProvider>
</TsukiProvider>
```

任意层级都可继续嵌套。每层只影响自己和后代，子级覆盖不会回写父级。`inherit: false` 让当前层从当前 scheme 的默认值开始，再应用本层 token：

```tsx
<ConfigProvider
  theme={{
    inherit: false,
    semantic: { colorPrimary: '#db2777' },
  }}
>
  <Button>Default theme with a local primary color</Button>
</ConfigProvider>
```

此例保留父级的 `light` 或 `dark` scheme，但重置其所有 semantic 和 component 覆盖。要恢复完整默认值，使用 `theme={{ inherit: false }}`。

Theme 可在运行时更新。每次变化都传入新的 `theme` 对象和需要更新的嵌套对象，React 会让 provider 重新合并并发布新值：

```tsx
setTheme((current) => ({
  ...current,
  semantic: { ...current.semantic, colorPrimary: '#7c3aed' },
}))
```

`useTsukiTheme()` 返回当前 resolved theme；组件通过该 context 读取颜色和 Component Token。根级 `scheme` 改变时，`inherit: false` scope 使用的新默认值也会随之更新。

## Semantic Tokens

当前有 10 个 Semantic Token。色值由 `packages/tsuki/src/theme/defaults.ts` 定义：

| Token                    | Light     | Dark      |
| ------------------------ | --------- | --------- |
| `colorPrimary`           | `#055FFD` | `#4D8DFF` |
| `colorPrimaryForeground` | `#ffffff` | `#111827` |
| `colorSuccess`           | `#15803d` | `#4ade80` |
| `colorWarning`           | `#b45309` | `#fbbf24` |
| `colorDanger`            | `#dc2626` | `#f87171` |
| `colorForeground`        | `#111827` | `#f9fafb` |
| `colorMuted`             | `#6b7280` | `#9ca3af` |
| `colorBackground`        | `#ffffff` | `#111827` |
| `colorSurface`           | `#f9fafb` | `#1f2937` |
| `colorBorder`            | `#e5e7eb` | `#374151` |

## Component Tokens

Component Token 按组件归组。数值单位为 React Native layout points；`disabledOpacity` 除外。标为 `StyleSheet.hairlineWidth` 的默认值由运行平台提供。

| Component | Token | Default |
| --- | --- | --- |
| Button | `borderRadius: 8`, `height: 44` | — |
| Input | `borderRadius: 8`, `height: 44` | — |
| Divider | `thickness` | `StyleSheet.hairlineWidth` |
| Surface | `borderRadius: 12`, `padding: 16`, `borderWidth` | `StyleSheet.hairlineWidth` |
| Card | `borderRadius: 12`, `padding: 16`, `headerPadding: 16`, `bodyPadding: 16`, `footerPadding: 16`, `gap: 0` | — |
| Cell | `paddingHorizontal: 16`, `paddingVertical: 10`, `largePaddingVertical: 14`, `minHeight: 44`, `largeMinHeight: 56` | — |
| Cell | `fontSize: 14`, `largeFontSize: 16`, `descriptionFontSize: 12`, `lineHeight: 22`, `descriptionLineHeight: 18`, `iconSize: 16` | — |
| Cell | `gap: 8`, `verticalGap: 6`, `titleExtraGap: 4`, `valueExtraGap: 4`, `dividerWidth` | `StyleSheet.hairlineWidth` |
| Cell | `groupTitlePaddingHorizontal: 16`, `groupTitlePaddingVertical: 10`, `groupInsetMarginHorizontal: 16`, `groupRadius: 12`, `disabledOpacity: 0.4` | — |

The current model has 35 Component Token values across these six groups. Semantic color, component dimensions, and group layout are the supported Theme override surface; the API does not define global font-family, spacing-scale, or radius-scale token maps.

## NativeWind integration

The package exports separate stylesheet resources for NativeWind v4 and v5. Tsuki Core does not install or configure either NativeWind runtime. The app imports its CSS entry, chooses its Metro/Tailwind configuration, and injects the resolved Theme variables.

### NativeWind v4

The v4 preset exports `@ftsukic/tsuki/nativewind-v4-preset`. With the repository's Tailwind 3/PostCSS configuration, import the installed static Theme CSS file directly:

```js
// tailwind.config.js
module.exports = {
  presets: [require('nativewind/preset'), require('@ftsukic/tsuki/nativewind-v4-preset')],
  content: ['./App.{js,jsx,ts,tsx}', './node_modules/@ftsukic/tsuki/dist/**/*.{js,cjs}'],
}
```

```css
/* global.css */
@import './node_modules/@ftsukic/tsuki/dist/theme/theme.css';

@tailwind base;
@tailwind components;
@tailwind utilities;
```

Tailwind 3's `postcss-import` does not resolve this package's CSS export map in the current consumer configuration. The direct installed path above is the path used by the v4 Consumer. Metro must load the stylesheet with `withNativeWind`.

### NativeWind v5

The v5 stylesheet export is `@ftsukic/tsuki/nativewind-v5.css`; `@ftsukic/tsuki/theme.css` supplies static light/dark fallback declarations. Import them after Tailwind's base and utility resources:

```css
/* global.css */
@import 'tailwindcss/theme.css' layer(theme);
@import 'tailwindcss/preflight.css' layer(base);
@import 'tailwindcss/utilities.css';
@import 'nativewind/theme';
@import '@ftsukic/tsuki/theme.css';
@import '@ftsukic/tsuki/nativewind-v5.css';

@source './node_modules/@ftsukic/tsuki/dist';
```

Configure PostCSS with `@tailwindcss/postcss` and Metro with `withNativewind`. The Metro config must exclude every dynamic `--tsuki-*` variable emitted by `serializeTheme()` from inlining. See the [complete v5 Metro config](../../../../apps/nativewind-v5-consumer/metro.config.js) for the current list.

## `serializeTheme()` and variable scopes

`serializeTheme(theme)` is a public helper that serializes all Semantic and Component Tokens to CSS variables. For example, `colorPrimary` becomes `--tsuki-color-primary`, `Button.borderRadius` becomes `--tsuki-button-border-radius`, and `Cell.disabledOpacity` becomes the unitless `--tsuki-cell-disabled-opacity`. Other numeric component values are serialized with `px`.

For NativeWind v4, pass the object to `vars()` on a View. For v5, pass it to `VariableContextProvider`:

```tsx
import { serializeTheme, useTsukiTheme } from '@ftsukic/tsuki'
import { vars } from 'nativewind'
import type { PropsWithChildren } from 'react'
import { View } from 'react-native'

// NativeWind v4
function ThemeVariables({ children }: PropsWithChildren) {
  const theme = useTsukiTheme()
  return <View style={[vars(serializeTheme(theme)), { flex: 1 }]}>{children}</View>
}
```

```tsx
import { serializeTheme, useTsukiTheme } from '@ftsukic/tsuki'
import { VariableContextProvider } from 'nativewind'
import type { PropsWithChildren } from 'react'
import { View } from 'react-native'

// NativeWind v5
function ThemeVariables({ children }: PropsWithChildren) {
  const theme = useTsukiTheme()
  return (
    <VariableContextProvider value={serializeTheme(theme)}>
      <View style={{ flex: 1 }}>{children}</View>
    </VariableContextProvider>
  )
}
```

Place the bridge inside the `TsukiProvider` or `ConfigProvider` whose variables it should expose. When a child scope has its own `ConfigProvider`, place another bridge under that provider so child CSS variables override only within the child subtree. The Playground and both [Consumer apps](../../../../apps/) contain full examples.

## Related documentation

- [Tsuki v2 components](../../index.md)
- [Package installation and runnable NativeWind setup](../../../../packages/tsuki/README.md)
- [Package, consumers, Playground, and release architecture](../../../architecture/tsuki-v2-project-framework.md)
