# Text 文本

## 介绍

Text 是跟随 Theme 的基础文本组件。它将 React Native 文本能力和 `colorText`、`fontFamily`、字号、行高及语义颜色结合起来，不引入 Web Heading 体系。

- **基础示例** [示例源码](../../../src/text/__fixtures__/overview.tsx)

## 引入

```tsx
import { ConfigProvider, darkAlgorithm, Text } from '@ftsukic/tsuki'
```

## 示例源码

- **基础文本**：默认文本跟随主题，显式 style 可以覆盖默认颜色。 [示例源码](../../../src/text/__fixtures__/examples/basic.tsx)

- **继承文本样式**：多层自定义组件中的 Tsuki Text 继承 Button 内容样式，并使用 NativeWind `className`。 [示例源码](../../../src/text/__fixtures__/examples/inheritance.tsx)

- **语义、尺寸和字重**：使用 default、secondary、tertiary、disabled 及三种字号表达文本层级。 [示例源码](../../../src/text/__fixtures__/examples/semantic.tsx)

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `children` | `ReactNode` | — | 文本内容或自定义 React 节点 |
| `className` | `string` | — | NativeWind class name；与继承的 class name 使用 `tailwind-merge` 合并 |
| `type` | `'default' \| 'secondary' \| 'tertiary' \| 'disabled'` | `'default'` | 语义文本颜色，分别对应 `colorText`、`colorTextSecondary`、`colorTextTertiary`、`colorTextDisabled` |
| `size` | `'small' \| 'normal' \| 'large'` | `'normal'` | 使用主题字号和绝对行高 |
| `weight` | `TextStyle['fontWeight']` | — | React Native 字重 |
| `style` | `StyleProp<TextStyle>` | — | 文本样式，优先于主题默认值、继承样式以及 type、size、weight |

组件继承 React Native `TextProps`（由组件管理 `children` 和 `style`）。来自 Button content 和 Cell 文本槽的 Tsuki Text 会继承相应 `TextStyle` 与 `className`，多层自定义组件、Fragment 和数组都会保留继承；本地 `type`、`size`、`weight` 只覆盖对应继承维度，`style` 优先级最高。原生 React Native `Text` 不消费 Tsuki 的继承上下文。主题外仍可直接使用，但会自动回退到默认主题；嵌套 `ConfigProvider` 会让文本跟随当前局部主题。

组件库兼容 NativeWind 4.2.5 的 `className` 接口能力；Example 使用 NativeWind 4.2.7。组件库不安装 NativeWind runtime，消费端需要自行安装和配置。该属性只负责把 class name 传给底层 React Native Text，不会替应用初始化 NativeWind。

Text 不提供 `Heading1`~`Heading5`、Web `linkDecoration`、hover 或 focus token。需要不同文本层级时使用 `type`、`size`、`weight` 和显式 `style` 组合。

## 主题定制

```tsx
<ConfigProvider theme={{ algorithm: darkAlgorithm }}>
  <Text type="secondary">跟随暗色主题的说明</Text>
</ConfigProvider>
```

`Text` 使用当前主题的 `fontFamily`；需要修改全局字体时配置 `theme.seed.fontFamily`，单个文本仍可通过 `style.fontFamily` 覆盖。
