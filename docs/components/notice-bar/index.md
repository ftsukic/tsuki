# NoticeBar 通知栏

## 介绍

NoticeBar 用于展示需要持续关注的消息通知，支持 Vant 风格的单行滚动、文本省略和多行换行。

- [组件预览：展示 NoticeBar 的基础、组合内容、滚动、换行、交互、禁用和主题示例。](../../../src/notice-bar/__fixtures__/overview.tsx)

## 引入

```tsx
import { NoticeBar } from '@ftsukic/tsuki'
```

## 代码演示

- [基础通知：展示基础通知和左侧自定义图标。](../../../src/notice-bar/__fixtures__/examples/NoticeBar.tsx)

- [组合内容：展示 children 自定义内容和静态右侧图标。](../../../src/notice-bar/__fixtures__/examples/custom-content.tsx)

- [滚动配置：展示短内容循环滚动以及 speed、delay 配置。](../../../src/notice-bar/__fixtures__/examples/scrollable.tsx)

- [换行：展示关闭滚动后的多行换行。](../../../src/notice-bar/__fixtures__/examples/wrapable.tsx)

- [交互：展示 onClick 计数和 onClose 隐藏当前通知。](../../../src/notice-bar/__fixtures__/examples/interaction.tsx)

- [禁用：展示通知栏和关闭操作的禁用状态。](../../../src/notice-bar/__fixtures__/examples/disabled.tsx)

- [主题和语义样式：展示主题覆盖、语义样式和独立的主体与关闭操作。](../../../src/notice-bar/__fixtures__/examples/theme.tsx)

## API

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| text | `string` | `''` | 通知文本；未传 `children` 时使用 |
| children | `ReactNode` | — | 自定义通知内容，优先于 `text` |
| leftIcon | `ReactNode` | — | 左侧自定义图标或内容 |
| rightIcon | `ReactNode` | — | 右侧自定义图标；配合 `onClose` 时作为关闭操作 |
| visible | `boolean` | `true` | 是否显示通知栏 |
| disabled | `boolean` | `false` | 禁止点击和关闭操作，并应用禁用透明度 |
| scrollable | `boolean` | — | `true` 始终滚动；`false` 禁止滚动；未设置时只在内容溢出时滚动 |
| wrapable | `boolean` | `false` | 允许换行；`scrollable=true` 优先，其他情况下启用换行时不滚动 |
| speed | `number` | `60` | 滚动速度，单位为 px/s；无效或非正数回退到默认值 |
| delay | `number` | `1` | 开始滚动前的延迟，单位为秒；负数按 0 处理 |
| style | `StyleProp<ViewStyle>` | — | 组件可见根节点样式，优先于 `styles.root` |
| styles | `NoticeBarStyles` | — | 语义样式对象，或接收 `{ props, state }` 的函数 |
| accessibilityLabel | `string` | — | 消息或可点击主体的可访问名称；自定义内容可显式指定 |
| accessibilityHint | `string` | — | 消息或可点击主体的操作提示 |
| leftIconAccessibilityLabel | `string` | — | 有意义的左图标描述；未设置时作为装饰隐藏 |
| rightIconAccessibilityLabel | `string` | — | 静态右图标描述；未设置时作为装饰隐藏，关闭按钮不使用此属性 |
| onClick | `() => void` | — | 点击通知栏时触发 |
| onClose | `() => void` | — | 点击关闭操作后触发；会同时隐藏当前实例 |

静态通知主体使用 `View`，消息区域使用 `alert` 和 `polite` live region。传入 `onClick` 后，主体使用 `button` 语义并在主体上设置 `polite` live region；内部消息区域不再建立独立可访问焦点。primitive 文本自动作为主体名称，自定义节点可通过 `accessibilityLabel` 指定。关闭按钮是主体的兄弟节点，具有独立的 `button` 语义、“关闭通知”标签和 disabled 状态。

只有传入 `onClick` 时，通知主体才有 pressed opacity 反馈；静态通知主体不会因触摸改变视觉。关闭操作独立使用 Alias 的 `pressedOpacity`，不受 `motion` 动画开关影响。

组件只接受上表中的公开 Props，不转发其他原生 `ViewProps` 或 `PressableProps`。默认颜色、字号、间距和动画总开关来自当前 `ConfigProvider` 的 Alias Token：默认使用 `colorWarningBg`、`colorWarning`、`padding`、`fontSize`、`lineHeightXL` 和 `motion`。

`children` 为自定义 React 节点时，组件负责布局和滚动容器，节点自身负责文本样式与换行。`scrollable={false}` 的 primitive 文本使用尾部省略；`scrollable=true` 优先于 `wrapable`；否则 `wrapable=true` 使用多行布局并关闭自动滚动。自定义 children 是展示内容，不支持内部独立按钮或链接；点击操作由 `onClick` 提供。

React Native 版本不提供 Vant Web 的 `mode`、`color`、`background`、字符串图标名、`replay` 事件或 `reset` 方法，也不使用 CSS、DOM 和 HTML 字符串。

## 语义结构与样式

```text
root
├─ body（静态 View / 可点击 Pressable）
│  ├─ leftIcon
│  └─ content（消息区域）
│     └─ 内部 viewport / 动画 / 测量节点
│        └─ text / children
└─ closeAction（关闭按钮）/ rightIcon（静态图标）
```

| 插槽        | 类型                   | 作用范围                                            |
| ----------- | ---------------------- | --------------------------------------------------- |
| root        | `StyleProp<ViewStyle>` | 可见根节点，包含背景和整体布局                      |
| body        | `StyleProp<ViewStyle>` | 左图标与消息的主体，关闭按钮不在此范围内            |
| content     | `StyleProp<ViewStyle>` | 消息区域，不包含左图标                              |
| text        | `StyleProp<TextStyle>` | 组件生成的 primitive 文本，不注入自定义 children    |
| leftIcon    | `StyleProp<ViewStyle>` | 左侧图标区域                                        |
| rightIcon   | `StyleProp<ViewStyle>` | 静态右侧图标区域                                    |
| closeAction | `StyleProp<ViewStyle>` | 关闭按钮；传入 `onClose` 时使用此槽替代 `rightIcon` |

样式优先级为默认主题样式 → 对应语义插槽 → 根节点 `style`。`styles` 函数的 state 包含 `visible`、`disabled`、`clickable` 和 `wrapable`；后者表示解析优先级后的有效换行状态。

viewport、平移容器和测量节点不公开样式插槽。primitive 文本的自然宽度由隐藏且不进入无障碍树的文本节点持续测量；自定义 children 只挂载一次并直接测量实际节点。字号、内容宽度或 viewport 宽度变化后会重新判断是否滚动并更新动画距离。
