# Text 文本

## 介绍

Text 是跟随 Theme 的基础文本组件。它将 React Native 文本能力和 `colorText`、`fontFamily`、字号、行高及语义颜色结合起来，不引入 Web Heading 体系。

- [组件预览](../../../src/text/__fixtures__/overview.tsx)

## 引入

```tsx
import { ConfigProvider, darkAlgorithm, Text } from '@ftsukic/tsuki'
```

## 代码演示

- [基础文本：默认文本跟随主题，显式 style 可以覆盖默认颜色。](../../../src/text/__fixtures__/examples/basic.tsx)

- [语义、尺寸和字重：使用 default、secondary、tertiary、disabled 及三种字号表达文本层级。](../../../src/text/__fixtures__/examples/semantic.tsx)

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 文本内容或自定义 React 节点 |
| `type` | `'default' \| 'secondary' \| 'tertiary' \| 'disabled'` | `'default'` | 语义文本颜色，分别对应 `colorText`、`colorTextSecondary`、`colorTextTertiary`、`colorTextDisabled` |
| `size` | `'small' \| 'normal' \| 'large'` | `'normal'` | 使用主题字号和绝对行高 |
| `weight` | `TextStyle['fontWeight']` | — | React Native 字重 |
| `style` | `StyleProp<TextStyle>` | — | 文本样式，放在主题默认样式之后，因此可以覆盖颜色、字体、字号和行高 |

组件继承 React Native `TextProps`（由组件管理 `children` 和 `style`）。主题外仍可直接使用，但会自动回退到默认主题；嵌套 `ConfigProvider` 会让文本跟随当前局部主题。

Text 不提供 `Heading1`~`Heading5`、Web `linkDecoration`、hover 或 focus token。需要不同文本层级时使用 `type`、`size`、`weight` 和显式 `style` 组合。

## 主题定制

```tsx
<ConfigProvider theme={{ algorithm: darkAlgorithm }}>
  <Text type="secondary">跟随暗色主题的说明</Text>
</ConfigProvider>
```

`Text` 使用当前主题的 `fontFamily`；需要修改全局字体时配置 `theme.seed.fontFamily`，单个文本仍可通过 `style.fontFamily` 覆盖。
